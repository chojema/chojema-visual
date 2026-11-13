import { spawnSync } from 'node:child_process';
import { constants } from 'node:fs';
import { access, copyFile, mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const usage = 'Usage: node render-html.mjs INPUT.html OUTPUT.mp4 --width 1920 --height 1080 --fps 30 --frames 450 [--playwright PATH] [--browser PATH] [--ffmpeg PATH]';

function positiveInteger(value, name) {
  const number = Number(value);
  if (!/^\d+$/.test(value ?? '') || !Number.isSafeInteger(number) || number < 1) {
    throw new Error(`--${name} must be a positive integer.`);
  }
  return number;
}

function ffmpegRun(command, args, stdio) {
  const result = spawnSync(command, args, { stdio, windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFmpeg failed (${result.signal ?? result.status}).`);
}

async function renderFrames(options, directory) {
  const { input, width, height, fps, frames, playwrightPath, executablePath } = options;
  const require = createRequire(input);
  let chromium;
  try {
    ({ chromium } = require(playwrightPath ? resolve(playwrightPath) : 'playwright'));
  } catch (error) {
    throw new Error('Playwright could not be loaded. See references/rendering.md or supply --playwright.', { cause: error });
  }

  // file:// ES 모듈(three.js 등)과 XHR 로드를 허용한다. 컨텍스트가 오프라인이라 외부 전송은 없다.
  // WebGL은 ANGLE SwiftShader로 고정한다. 기본 Vulkan 경로는 처음 약 27번의 그림을 화면에 늦게 올려 앞 프레임이 빈 화면이 된다.
  const browser = await chromium.launch({
    executablePath,
    args: ['--allow-file-access-from-files', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  try {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      serviceWorkers: 'block',
      offline: true,
    });
    await context.addInitScript(() => { window.__CHOJEMA_RENDER__ = true; });
    const page = await context.newPage();
    const failures = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('requestfailed', (request) => failures.push(`Could not load ${request.url()}`));
    await page.goto(pathToFileURL(input).href, { waitUntil: 'load', timeout: 30_000 });
    for (let frame = 0; frame < frames; frame += 1) {
      await page.evaluate(async ({ frame, fps }) => {
        if (typeof window.renderFrame !== 'function') {
          throw new Error('The page must define window.renderFrame(frame, fps).');
        }
        let timeout;
        try {
          await Promise.race([
            Promise.resolve().then(async () => {
              await window.renderFrame(frame, fps);
              await document.fonts.ready;
            }),
            new Promise((_, reject) => {
              timeout = setTimeout(() => reject(new Error('Frame assets did not become ready.')), 15_000);
            }),
          ]);
        } finally {
          clearTimeout(timeout);
        }
      }, { frame, fps });
      await page.screenshot({ path: join(directory, `frame-${String(frame).padStart(8, '0')}.png`) });
      if (failures.length) throw new Error(`Frame ${frame}: ${failures.join('; ')}`);
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean' },
      width: { type: 'string' },
      height: { type: 'string' },
      fps: { type: 'string' },
      frames: { type: 'string' },
      playwright: { type: 'string' },
      browser: { type: 'string' },
      ffmpeg: { type: 'string', default: 'ffmpeg' },
    },
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  if (positionals.length !== 2) throw new Error(usage);
  const [input, output] = positionals.map((path) => resolve(path));
  if (!['.html', '.htm'].includes(extname(input).toLowerCase()) || !(await stat(input)).isFile()) {
    throw new Error('Input must be a local HTML file.');
  }
  if (extname(output).toLowerCase() !== '.mp4') throw new Error('Output must end in .mp4.');
  const width = positiveInteger(values.width, 'width');
  const height = positiveInteger(values.height, 'height');
  const fps = positiveInteger(values.fps, 'fps');
  const frames = positiveInteger(values.frames, 'frames');
  if (width % 2 || height % 2) throw new Error('Width and height must be even for yuv420p.');
  try {
    await access(output);
    throw new Error(`Output already exists: ${output}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  ffmpegRun(values.ffmpeg, ['-version'], 'ignore');
  await mkdir(dirname(output), { recursive: true });
  const directory = await mkdtemp(join(dirname(output), '.chojema-render-'));
  try {
    await renderFrames({
      input, width, height, fps, frames,
      playwrightPath: values.playwright,
      executablePath: values.browser ? resolve(values.browser) : undefined,
    }, directory);
    const encoded = join(directory, 'video.mp4');
    ffmpegRun(values.ffmpeg, [
      '-hide_banner', '-loglevel', 'error', '-nostdin', '-n',
      '-framerate', String(fps), '-start_number', '0', '-i', join(directory, 'frame-%08d.png'),
      '-frames:v', String(frames), '-an',
      // PNG(RGB)를 BT.709로 변환한다. FFmpeg 7 이상은 입력 프레임의 색 정보가 -color_* 출력 옵션보다 앞서므로 setparams로 태그를 확정한다.
      '-vf', 'scale=out_color_matrix=bt709:out_range=tv,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
      '-movflags', '+faststart', encoded,
    ], 'inherit');
    await copyFile(encoded, output, constants.COPYFILE_EXCL);
    console.log(`${output} (${frames} frames at ${fps} fps)`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.message);
  if (error.cause) console.error(error.cause.message);
  process.exitCode = 1;
});
