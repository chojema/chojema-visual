# 2D 렌더링

이미 Remotion, HyperFrames 또는 다른 영상 엔진이 있는 작업은 그 프로젝트에서 수정하고 기존 방식으로 렌더링한다. 아래 방식은 새 로컬 HTML, SVG, Canvas 작업에 사용한다. [demo.html](../assets/demo.html)은 가상 제품의 세 장면을 담은 수정용 견본이다. 견본은 `assets/fonts`의 Pretendard 가변 글꼴(SIL OFL 1.1, 원본 그대로 포함)과 로컬에서 합성한 `demo-audio.mp3`를 상대 경로로 읽는다.

| 숏 | 30 fps 프레임 범위 | 화면과 연결 |
| --- | --- | --- |
| 01 요청 | 0~59 | 원형 체크 배지에 시선을 모은다. 커서가 배지를 누르면 배지가 넓어지면서 다음 숏의 카드 바탕이 된다. |
| 02 정리 | 60~155 | 카드에 요청 내용, 담당자, 검토 상태가 나타난다. 같은 카드가 낮아지며 버튼 모양으로 바뀐다. |
| 03 행동 유도 | 156~239 | 바뀐 버튼에 “작업 공간 둘러보기”를 표시하고 읽을 시간을 준다. |

## 장면 계약

- HTML은 최종 화면 비율에 맞춰 전체 뷰포트를 채우고 스크롤바 없이 렌더한다. 자산은 프로젝트 아래 상대 경로로 놓는다. 글꼴과 이미지는 프로젝트 안의 파일로 읽는다. 시스템 글꼴에 기대면 렌더하는 컴퓨터마다 다른 글꼴로 바뀐다. 글꼴 파일을 함께 넘길 때는 라이선스 파일도 같은 폴더에 둔다. 경로에 공백과 한글이 있어도 파일 URL로 열 수 있어야 한다.
- `window.renderFrame(frame, fps)`에서 `frame / fps`로 시간과 상태를 계산한다. 임의의 프레임을 여러 번 호출해도 같은 화면이어야 한다. 시드 없는 무작위, 누적 변형, 독립적으로 재생되는 CSS 애니메이션은 프레임 출력에서 제외한다. 비동기 자산을 쓸 때는 읽기와 디코딩을 끝내는 Promise를 반환한다. 글꼴은 `document.fonts.load()`로 읽기를 마친 뒤 그린다. 이미지 누락이나 실제 영상 탐색 실패는 예외로 알린다.
- 브라우저 미리보기는 `requestAnimationFrame`으로 같은 함수를 호출한다. 렌더러가 주입하는 `window.__CHOJEMA_RENDER__`가 참이면 자동 재생과 미리보기 조작부를 끈다. 마지막 프레임에 행동 유도 문구와 브랜드를 담고, 마지막이 재생기 자체의 검은 화면으로 끝나지 않게 한다.
- WebGL과 three.js 장면은 [three.js 3D](threejs.md)의 추가 규칙을 따른다. 렌더러는 `file://`의 ES 모듈과 XHR 읽기를 허용하고 WebGL을 SwiftShader로 그린다.
- SVG 경로를 직접 보간할 때 두 경로의 점 개수와 순서를 맞춘다. 구성이 다르면 같은 물체를 중간 형태로 한 번 변형하거나, 이어받는 레이어를 마스크로 드러낸다. 모바일용과 가로형은 각각 타이포그래피와 UI 크기를 조정한다.

## 화면 녹화와 UI 캡처

화면 녹화 영상은 `<video>`로 직접 넣지 않는다. 프레임마다 재생 위치를 옮기고 그 완료를 기다리는 방식은 헤드리스 렌더에서 끝나지 않고 멈출 수 있다. 녹화본을 영상과 같은 fps의 이미지 시퀀스로 먼저 뽑고, 프레임 번호로 이미지를 고른다. 녹화 구간이 숏 중간에서 시작하면 `frame - 시작 프레임`으로 번호를 맞춘다.

```text
ffmpeg -n -i recording.mp4 -vf fps=30 -q:v 2 -start_number 0 rec/%05d.jpg
```

```js
const recording = document.getElementById('rec'); // <img id="rec">
const recordingFrames = 90; // rec 폴더의 이미지 수
async function drawRecording(frame) {
  const index = Math.min(Math.max(frame, 0), recordingFrames - 1);
  recording.src = `rec/${String(index).padStart(5, '0')}.jpg`;
  await recording.decode();
}
```

`renderFrame` 안에서 `await drawRecording(frame - 시작 프레임)`처럼 기다린다. 확대가 없는 녹화는 JPEG로 충분하고, 글자를 크게 확대하거나 색이 중요하면 PNG로 뽑는다. 공개 웹 화면을 Playwright로 새로 캡처할 때는 `browser.newContext({ viewport, deviceScaleFactor: 2 })`처럼 확대 배율에 맞춰 배율을 올린다.

## HTML 결과물의 소리

브라우저는 사용자 조작 없이 소리를 재생하지 않는다. HTML을 최종 결과물로 줄 때는 화면은 소리 없이 재생하고, 소리 켜기 단추를 눌렀을 때 `audio.currentTime`을 현재 프레임 시간에 맞춘 뒤 재생한다. 소리가 재생되는 동안에는 `audio.currentTime`을 기준 시계로 삼아 프레임을 계산하고, 일시 정지, 탐색, 끝에서 소리를 함께 멈추거나 옮긴다. 렌더 때는 `<audio preload="none">`으로 두어 소리를 읽지 않는다. 구현은 견본의 `syncAudio()`를 따른다.

## MP4 내보내기

Node.js 22 이상, Playwright의 Chromium 헤드리스 셸, `libx264`를 지원하는 FFmpeg가 필요하다. 이 환경은 HTML을 MP4로 내보낼 때만 준비한다. Playwright를 재사용할 수 있으면 그 경로를 지정한다. 새로 준비할 경우 작업 폴더에서 실행한다. 예시의 `<skill>`은 스킬 폴더의 경로다.

```text
npm install --prefix render-runtime playwright
node render-runtime/node_modules/playwright/cli.js install --only-shell chromium
node "<skill>/scripts/render-html.mjs" "<skill>/assets/demo.html" demo.mp4 --playwright "render-runtime/node_modules/playwright" --width 960 --height 540 --fps 30 --frames 240
```

렌더러는 헤드리스로만 실행하므로 `--only-shell`로 헤드리스 셸만 받아 일반 Chromium 다운로드를 생략한다. 실제 영상은 `--width`, `--height`, `--fps`, `--frames`를 스토리보드와 일치시킨다. Playwright와 브라우저 버전은 가능하면 함께 유지한다. 설치된 Chromium 실행 파일을 별도로 쓰는 환경에서는 `--browser <실행 파일 경로>`를 쓴다. "Executable doesn't exist"와 `npx playwright install` 안내가 나오면 Playwright 패키지가 기대하는 브라우저 버전이 없다는 뜻이다. 새로 받기 전에 `ms-playwright` 캐시(Windows는 `%LOCALAPPDATA%\ms-playwright`)에 있는 `chromium_headless_shell-*` 실행 파일을 `--browser`로 지정해 본다. FFmpeg가 기본 경로에 없으면 `--ffmpeg <실행 파일 경로>`를 쓴다. 렌더러는 PNG를 BT.709로 변환하고 `setparams`로 색 태그를 붙인다. FFmpeg 7 이상에서는 입력 PNG의 색 정보가 `-color_primaries`, `-color_trc` 출력 옵션보다 우선하므로 이 옵션만으로는 태그가 `unknown`이나 sRGB로 남는다. 색 행렬을 지정하지 않으면 브랜드 색이 어둡게 바뀔 수 있으므로, 다른 도구로 인코딩할 때도 같은 설정을 쓴다. 렌더 중에는 출력 폴더의 임시 하위 폴더에 PNG가 쌓이므로 여유 공간을 확인한다. 기존 MP4는 보호되므로 수정본은 새 이름으로 쓴다.

전환을 확인할 때는 전체 재생과 함께 의심 구간의 프레임을 추출한다. 영상에 파일로 제공된 캡처를 사용했다면 원본 UI와 화면을 나란히 확인한다. 렌더가 끝나면 FFprobe의 `-count_frames`와 `nb_read_frames`로 프레임 수를, `color_space` 등으로 색 태그를 확인한다. 눈에 띄는 화질 손상이 없는지 실제 크기에서도 본다.

```text
ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=codec_name,width,height,avg_frame_rate,nb_read_frames,duration,color_space,color_primaries,color_transfer -of json demo.mp4
```

[Playwright 브라우저 문서](https://playwright.dev/docs/browsers)
