# Chojema Visual

[한국어](README.md) | **English**

An all-in-one production skill for AI coding agents, covering everything from a small model fix to 3D animation, motion graphics, footage editing and animated slide decks.

Install one skill and ask for the work you need: the agent picks only the instructions and tools that job requires. A single task stays focused on making and checking that one element, while larger productions connect several modules inside one project.

The skill's description is written so agents recognize requests in English or Korean, and results are written in the language you use. The detailed reference documents under `references/` are written in Korean; agents read them directly, so you do not need to.

## What it does

| Area | Examples | Output |
| --- | --- | --- |
| Blender 3D | Modeling, materials, lighting, cameras, still renders, animation | `.blend`, images, frame sequences, video |
| three.js 3D | Spinning logos, product turntables, 3D charts, particles and Blender models (`.glb`) inside HTML scenes and decks | HTML, MP4 |
| 2D motion graphics | Moving type and shapes, shape morphs, scene transitions | HTML, video |
| Product videos | Demos built from real app screens, feature explainers, product ads | HTML, MP4 |
| Motion showreels | Brand motif transformations, music-synced cuts | Video |
| Footage editing | Trims, transcript-based silence removal, captions and B-roll | Edited video, edit decision list, retimed transcript |
| PowerPoint visual elements | Diagrams, SmartArt, shapes and connectors, graphic effects, data charts, animations and slide transitions | Editable PowerPoint (`.pptx`), previews when needed |
| Presentations | Slide structure, per-slide motion graphics, keyboard navigation, presenter-controlled transitions | HTML slide deck, PowerPoint (`.pptx`) |

Existing projects keep their engine and file formats. PowerPoint requests can cover a single visual element, including diagram selection, matching existing styles, layout and accessibility checks, and optional reusable samples. The [PowerPoint module](references/powerpoint.md) (in Korean) prefers PowerPoint automation for actual SmartArt and native effects; environments limited to file generation stay within their tools' capabilities. Editable objects, chart data, and playback are checked separately.

## Getting started

### 1. Install the skill

This repository is the skill folder. `SKILL.md` sits at the top of the repository, so place it in your agent's skill location under the name `chojema-visual`. One installation can serve several agents.

**Option 1. Install with Git (easy updates)**

```sh
git clone https://github.com/chojema/chojema-visual.git ~/.agents/skills/chojema-visual
```

To update, run `git pull` in the installed folder. Changes for each version are listed in the [changelog](CHANGELOG.md) (written in Korean).

**Option 2. Install from a zip**

Download `chojema-visual-<version>.zip` from the [latest release](https://github.com/chojema/chojema-visual/releases/latest) and extract it into your skill location. The zip's top-level folder is already named `chojema-visual`, so leave it as is. GitHub's "Download ZIP" button under Code extracts to `chojema-visual-main`; if you use it, rename the folder to `chojema-visual`.

`SKILL.md` must sit directly inside the installed folder. Make sure you do not end up with an extra level such as `chojema-visual/chojema-visual/SKILL.md`. If a skill with the same name already exists, compare it and the changelog before deciding where to install.

#### Per-project and per-user installation by agent

A per-user installation applies to all of the current user's projects. For installing for every user on a machine, see system-wide installation below. `~` is your home folder (`$HOME` in Windows PowerShell). The table reflects default settings.

| Agent | Install for one project | Install for all of your projects | Official docs |
| --- | --- | --- | --- |
| Codex | `<project>/.agents/skills/chojema-visual/` | `~/.agents/skills/chojema-visual/` | [Skill installation and discovery](https://learn.chatgpt.com/docs/build-skills) |
| Claude Code | `<project>/.claude/skills/chojema-visual/` | `~/.claude/skills/chojema-visual/` | [Skill locations and usage](https://code.claude.com/docs/en/skills) |
| Antigravity App, CLI, IDE | `<project>/.agents/skills/chojema-visual/` | `~/.gemini/config/skills/chojema-visual/` | [Skill locations](https://antigravity.google/docs/skills) |
| OpenCode | `<project>/.opencode/skills/chojema-visual/` | `~/.config/opencode/skills/chojema-visual/` | [Skill discovery](https://opencode.ai/docs/skills) |

The Antigravity per-user path above is shared by the App, CLI and IDE. For CLI-only paths and paths used by older versions, see the [official guide](https://antigravity.google/docs/skills). OpenCode also reads the compatible `.agents/skills` and `.claude/skills` paths, in projects and in each user's home. If the same skill is installed in several places, discovery order may pick a different copy, so choose one location. [OpenCode discovery and precedence](https://opencode.ai/docs/skills)

#### Sharing one copy across agents

Inside a project, `.agents/skills/chojema-visual/` can serve as the shared location for Codex, Antigravity and OpenCode. For Claude Code, copy the same contents to `.claude/skills/chojema-visual/` or create a link to the shared folder. This layout follows the discovery rules of [Codex](https://learn.chatgpt.com/docs/build-skills), [Antigravity](https://antigravity.google/docs/skills), [OpenCode](https://opencode.ai/docs/skills) and [Claude Code](https://code.claude.com/docs/en/skills).

To share it per user, install the source at `~/.agents/skills/chojema-visual/`. Codex and OpenCode read that location; for Claude Code and Antigravity, link their per-user locations to the source. With links, editing one source updates every agent. If an agent's file access policy blocks links, copy the folder to each location and keep the copies in sync.

Run the commands below after installing the source at `~/.agents/skills/chojema-visual/`. Create links only for the agents you actually use.

**Windows PowerShell**

This example links local folders with junctions. Keep the source and the links on the local file system, and clean up any existing installation separately after comparing it. Do not use an overwrite option with `New-Item`.

```powershell
$skillTarget = (Resolve-Path -LiteralPath "$HOME/.agents/skills/chojema-visual").Path
New-Item -ItemType Directory -Force -Path "$HOME/.claude/skills", "$HOME/.gemini/config/skills" | Out-Null
New-Item -ItemType Junction -Path "$HOME/.claude/skills/chojema-visual" -Target $skillTarget
New-Item -ItemType Junction -Path "$HOME/.gemini/config/skills/chojema-visual" -Target $skillTarget
```

**macOS and Linux**

Existing installations or links are skipped. The script checks that the source is installed, then creates symbolic links.

```sh
skill_target="$HOME/.agents/skills/chojema-visual"
if [ ! -f "$skill_target/SKILL.md" ]; then
  printf '%s\n' 'Install the source skill first.' >&2
else
  for skill_root in "$HOME/.claude/skills" "$HOME/.gemini/config/skills"; do
    skill_link="$skill_root/chojema-visual"
    if [ -e "$skill_link" ] || [ -L "$skill_link" ]; then
      printf 'Existing path: %s\n' "$skill_link" >&2
      continue
    fi
    mkdir -p "$skill_root"
    ln -s "$skill_target" "$skill_link"
  done
fi
```

#### System-wide installation and organization rollout

To provide the skill to every user on a machine, an administrator deploys it. Where a default system path is supported, place the `chojema-visual` folder at:

| Target | Location |
| --- | --- |
| Codex environments using the `/etc` managed path | `/etc/codex/skills/chojema-visual/` |
| Claude Code, Linux and WSL | `/etc/claude-code/.claude/skills/chojema-visual/` |
| Claude Code, macOS | `/Library/Application Support/ClaudeCode/.claude/skills/chojema-visual/` |
| Claude Code, Windows | `C:\Program Files\ClaudeCode\.claude\skills\chojema-visual\` |

The Codex managed path follows the [OpenAI documentation](https://learn.chatgpt.com/docs/build-skills); Claude Code enterprise skill placement follows [skill locations](https://code.claude.com/docs/en/skills) and the [managed folders per operating system](https://code.claude.com/docs/en/managed-settings). Writing to system paths requires write permission for those paths.

To roll out to several agents including Antigravity and OpenCode, keep the source in a shared folder chosen by the administrator and deploy copies or links to each user's per-user location above. For example, `C:\ProgramData\ChojemaVisual\chojema-visual\` on Windows or `/opt/chojema-visual/` on macOS and Linux can hold the source. These are storage locations chosen by the administrator; each agent's discovery path still needs to be linked to them.

Give user accounts read access to the shared source and keep update rights with administrators. To cover every user, deploy the links to each account, including new ones. Install and configure runtime tools such as Blender, Node.js and FFmpeg separately.

#### Checking that the skill is recognized

| Agent | Check and invoke |
| --- | --- |
| Codex CLI, IDE extension | Check with `/skills` or by typing `$`, invoke with `$chojema-visual`. Restart if a new skill does not appear |
| Claude Code | Check in the `/` menu, invoke with `/chojema-visual` |
| Antigravity App, CLI | Invoke with `/chojema-visual`. If the CLI does not show a new skill, use `/skills reload` or start a new conversation |
| Antigravity IDE | Check active skills under Customizations in the side panel and mention `chojema-visual` in your request |
| OpenCode | Invoke with `@chojema-visual` in the prompt |

Invocation follows each agent's official documentation above. If the skill does not appear, check the location of `SKILL.md`, its `name`, duplicate installations, whether it is enabled, and file access permissions. This guide assumes a local environment; cloud sessions need the files and tools available in that environment.

### 2. Prepare the tools you need

Prepare only the tools your task needs. The skill provides production instructions and helper tools; the actual work runs in your local environment or connected editing tools.

| Task | Requirements |
| --- | --- |
| Blender work | [Blender](https://www.blender.org/download/) or an available Blender connector |
| Playing HTML slide decks | A browser |
| PowerPoint visual elements and effects | An editing connector with verified support, or Microsoft PowerPoint on Windows (COM through PowerShell or an available Python COM bridge) |
| PowerPoint basic shapes and file generation | Python and [python-pptx](https://python-pptx.readthedocs.io/) or another supported generator; native editing and playback checks require a separate compatible environment |
| Beat grid calculation | [Node.js](https://nodejs.org/en/download) |
| Transcript-based edit plans | Node.js and a timed transcript (word or segment level) |
| Local transcription | FFmpeg 8.0 or later with Whisper support and a [whisper.cpp model](https://huggingface.co/ggerganov/whisper.cpp), or another local transcription tool |
| Transcript-based video edits | Node.js, [FFmpeg and FFprobe](https://ffmpeg.org/download.html), the source video and transcript |
| Local HTML to MP4 | Node.js 22 or later, [Playwright and Chromium](https://playwright.dev/docs/browsers), FFmpeg with `libx264` |
| three.js 3D scenes | [three.js](https://threejs.org/) files kept inside the project. MP4 output uses the HTML setup above; browser preview needs a local server |
| Existing HyperFrames or GSAP projects | The runtime configured in that project |

The Blender sample's Python script runs in Blender's bundled Python. Detailed setup and output commands are in [3D production](references/blender.md), [HTML rendering](references/rendering.md) and [footage editing](references/editing.md) (in Korean).

### 3. Make a request

Invoke the skill and state the files to use, the result you want and where to save it. The examples below use Codex's `$chojema-visual`; for other agents, use the notation from the table above and replace the paths with your own.

**Small Blender fix**

```text
$chojema-visual Change only the sphere in scene.blend to a 20 cm diameter
and save it as scene-v2.blend.
```

**3D animation**

```text
$chojema-visual Make a 6-second animation of the product in product.blend slowly rotating.
Render at 1920x1080, 30 fps, and save the .blend and MP4 to output.
```

**Product demo and motion graphics**

```text
$chojema-visual Make a 15-second product demo from the app screens and logo in assets.
Show the key feature with real screens and have each card carry into the next scene.
```

**Silence removal from footage**

```text
$chojema-visual Shorten the long silences in recording.mp4 using transcript.json.
Keep pauses used for emphasis, and save the edited video and retimed transcript to output.
```

**Motion slide deck**

```text
$chojema-visual Build a 5-slide HTML deck from outline.md.
Make it keyboard-navigable and add motion graphics that explain the key relationships.
```

**PowerPoint animation**

```text
$chojema-visual Make a PowerPoint slide where a soccer ball rolls from the left edge
to the right edge. Draw the ball with editable shapes.
```

**Visual elements in an existing slide**

```text
$chojema-visual Replace the explanation on slide 3 of proposal.pptx with an editable flowchart.
Match the existing theme and fonts, and add attached connectors and click-by-click build animations.
Preserve the other slides and save output/proposal-v2.pptx.
```

Specify actual SmartArt when you need a SmartArt object rather than a diagram recreated with shapes. You can also request slide transitions and data charts; execution and verification depend on the available tools.

Larger productions can chain footage editing, 3D scenes, 2D graphics and sound in whatever order the work needs. It helps to state the final file format and whether you also want the source project.

## Loaded as the work requires

[SKILL.md](SKILL.md) is the entry point that classifies a request and routes it to the right reference document. Detailed instructions and assets are read or used only when a task needs them.

- Fixing one model focuses on the Blender instructions and checking the result.
- Multi-scene work organizes scene timing, assets and transitions together.
- Larger productions connect only the modules actually used, plus compositing and verification.

This design limits what is read to the type and size of the task; it is not a measured guarantee of processing time or token savings.

## Included files

| Path | Contents |
| --- | --- |
| [SKILL.md](SKILL.md) | Skill identifier, task routing and shared production rules |
| [agents/openai.yaml](agents/openai.yaml) | Display name and default prompt |
| `references/` | Guides for 3D, three.js 3D, 2D motion, product videos, showreels, editing, PowerPoint visual elements, presentations, rendering and audio (in Korean) |
| `scripts/` | HTML video renderer, transcript-based editing tools, beat grid calculator |
| `assets/` | HTML video and slide deck samples, Blender scene sample, templates, synthesized audio, three Korean fonts (Pretendard, Gowun Batang, Gowun Dodum; usage in [runtime and sources](references/sources.md), in Korean) |
| [tests/helpers.test.mjs](tests/helpers.test.mjs) | Automated tests for editing, transcript conversion, beat grid, HTML renderer (including the first WebGL frame) and Blender sample |
| [LICENSE](LICENSE) | MIT License |
| [CHANGELOG.md](CHANGELOG.md) | Changes per version (in Korean) |
| [README.md](README.md) / [README.en.md](README.en.md) | Installation and usage guide in Korean / English |

### Running the helper tools directly

Run commands from the folder containing this README. Keep your actual project files in a separate project folder.

| Tool | Role |
| --- | --- |
| [render-html.mjs](scripts/render-html.mjs) | Renders local HTML that follows the frame contract to MP4 |
| [cut-silences.mjs](scripts/cut-silences.mjs) | Shortens long silences using transcript word timings |
| [apply-cuts.mjs](scripts/apply-cuts.mjs) | Applies reviewed cut ranges and retimes the transcript |
| [media-edit.mjs](scripts/media-edit.mjs) | Input validation, timeline handling and output protection shared by both editors |
| [whisper-transcript.mjs](scripts/whisper-transcript.mjs) | Converts Whisper output from FFmpeg, whisper.cpp and others into the editors' transcript format |
| [beatgrid.mjs](scripts/beatgrid.mjs) | Computes scene times and frame ranges on a constant beat grid |

Beat grid example. The tool does not analyze music files, so confirm the BPM or beat period separately.

```sh
node scripts/beatgrid.mjs --bpm 120 --fps 30 --length 8 --chapters "Intro:4,Morph:8,Outro:rest"
```

Run any of the five direct tools with `--help` to see its options. `media-edit.mjs` is used internally by the editors. The editing tools write a plan by default and render video only with `--apply`. Input formats and examples are in the [footage editing guide](references/editing.md) (in Korean).

### Viewing the samples

After downloading the repository, open the [video sample](assets/demo.html) or the [slide deck sample](assets/slides.html) in a browser. Fonts and audio are linked by relative paths, so keep the `assets` folder structure.

The slide deck sample can be navigated with the arrow keys, Page Up, Page Down, Home, End and the on-screen buttons. It also includes reduced-motion and print layouts. Products and copy in the samples are fictional. The sample copy is in Korean.

## Verification

```sh
node --test tests/helpers.test.mjs
```

The tests cover beat grid ranges, merging of cut ranges, transcript retiming, chained edits, Whisper output conversion, renderer argument checks, input validation and protection of existing files. With FFmpeg installed they also check a real edit of a synthetic video, including output streams and duration; without it those tests are skipped. Set `CHOJEMA_PLAYWRIGHT` (the Playwright package path) and, if needed, `CHOJEMA_BROWSER` (a headless Chromium executable) to test real MP4 output from the HTML renderer. Set `CHOJEMA_BLENDER` to the path of `blender.exe` (not `blender-launcher.exe`) to test building and rendering the Blender sample scene.

The following was verified for version 1.3.1 on 2026-11-09.

| Area | Verified |
| --- | --- |
| Automated tests | All 17 tests pass, including real FFmpeg edits, HTML renderer MP4 output and the Blender sample render |
| Local transcription | Synthesized speech → FFmpeg 8.0 `whisper` filter (large-v3-turbo) → transcript conversion → silence-removed MP4 |
| Skill structure | Metadata, a single entry point, links to local documents and assets |
| HTML slide deck | Content appears after button and keyboard navigation, first and last slide boundaries, reduced motion, print, mobile layout |
| HTML video | Scene boundaries, identical output for the same frame, small MP4 export, local loading and rendering of the three Korean fonts |
| PowerPoint 16.0 (Microsoft 365) | Motion path and spin animations on a python-pptx shape group are recognized; video export confirms start, middle and end positions and rotation |
| Blender 5.2.3 LTS | Sample scene creation, EEVEE previews and a full 72-frame render, BT.709 MP4 encoding, material colors and rotation |

Separate HyperFrames projects and PowerPoint playback on macOS were not part of this verification. Only motion path and spin effects were checked in PowerPoint, so check other animation effects in your own environment.

The PowerPoint module in version 1.4.0 was additionally checked on November 9, 2026, using PowerPoint 16.0 and Python 3.13 COM automation. Twelve key checks passed, covering real SmartArt and Korean text, attached connectors after moving a shape, embedded chart data and retained values, shape merging, saved and reopened animations and transitions, and click progression in a windowed slide show. Four static renders were inspected. The initial PowerShell COM test did not complete, so testing switched to Python; the full PowerShell path is not verified.

Morph, all effects and SmartArt layouts, object-click triggers, SVG path editing, matching styles in existing complex decks, accessibility UI checks, other operating systems, and actual skill reloading in other agents remain unverified. The module provides production instructions and uses the tools available for each task. Of the 17 basic package tests, 15 passed; real HTML rendering and Blender tests were skipped because their environment variables were not set. These results are separate from the full rendering checks recorded above for version 1.3.1.

The three.js module in version 1.5.0 was checked on 2026-11-13 on Windows with Playwright 1.51.1 and its headless Chromium shell, three.js r170 and FFmpeg 8.0. A scene that loads local ES modules and a `.glb` was rendered with `render-html.mjs` to a 60-frame MP4; the model is visible from the first frame and the same frame matches when rendered in a different order. The renderer's default WebGL path left roughly the first 27 frames blank, so it now pins SwiftShader, and an automated test covers this. The Blender 5.2.3 LTS sample scene was exported to `.glb`, rendered in three.js and compared with Blender renders at frames 1, 19, 37, 55 and 72. Bevelled geometry, camera framing, material colour and rotation (56.25°, 180°, 303.75° and so on) matched. This check found that modifiers need an explicit apply option, cameras need to be exported, and the key times are one frame late unless offset; the guide now covers all three. Lights and shadows do not carry over through glTF, so shading differs. With both Blender and Playwright environment variables set, all 18 automated tests passed. GPU-backed environments, other operating systems, other three.js versions and 3D inside presentation decks remain unverified.

## Sources and outputs

Sources are preserved and results are saved to separate paths by default. The included renderer and editing tools never overwrite existing output files. When resuming after an interruption, check the output paths as well.

Real product logos, screens and features are used only from the materials you provide. Prepare music, voice, photos and models that you are allowed to use. An HTML slide deck, an editable PowerPoint file and a recorded presentation video are different deliverables, so specify the format you need.

When you include a bundled font in your outputs, keep that font's OFL notice file in the same folder ([License](#license)). Font usage and weights, runtime requirements and bundled assets are described in [runtime and sources](references/sources.md) (in Korean).

## License

The documents, scripts and samples are provided under the [MIT License](LICENSE).

The bundled fonts are not covered by the MIT License; each follows its own SIL Open Font License 1.1.

| Font | Copyright | License notice |
| --- | --- | --- |
| Pretendard | Kil Hyung-jin | [Pretendard-OFL.txt](assets/fonts/Pretendard-OFL.txt) |
| Gowun Batang | The Gowun Batang Project Authors (designer Yanghee Ryu) | [GowunBatang-OFL.txt](assets/fonts/GowunBatang-OFL.txt) |
| Gowun Dodum | The Gowun Dodum Project Authors (designer Yanghee Ryu) | [GowunDodum-OFL.txt](assets/fonts/GowunDodum-OFL.txt) |
