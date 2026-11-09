# Chojema Visual

**한국어** | [English](README.en.md)

작은 모델 수정부터 3D 애니메이션, 모션 그래픽, 영상 편집과 움직이는 발표 자료까지 다루는 통합 제작 스킬입니다.

하나의 스킬을 설치하고 작업을 요청하면, 필요한 기능의 지침과 도구를 선택해 사용합니다. 단독 작업은 해당 요소를 만들고 확인하는 데 집중하고, 복합 작업은 여러 제작 기능을 같은 프로젝트 안에서 연결합니다.

## 할 수 있는 작업

| 분야 | 작업 예시 | 결과물 |
| --- | --- | --- |
| Blender 3D | 모델링, 재질, 조명, 카메라, 정지 렌더, 애니메이션 | `.blend`, 이미지, 프레임 시퀀스, 영상 |
| 2D 모션 그래픽 | 글자와 도형의 움직임, 형태 변환, 장면 전환 | HTML, 영상 |
| 제품 영상 | 실제 앱 화면을 이용한 시연, 기능 설명, 제품 광고 | HTML, MP4 |
| 모션 쇼릴 | 브랜드 모티프 변형, 음악 박자에 맞춘 구성 | 영상 |
| 촬영본 편집 | 구간 삭제, 전사 기반 무음 제거, 자막과 보조 장면 구성 | 편집 영상, 편집 결정 목록, 재배치된 전사문 |
| PowerPoint 시각 요소 | 다이어그램, 스마트아트, 도형과 연결선, 그래픽 효과, 데이터 차트, 애니메이션과 전환 | 편집 가능한 PowerPoint(`.pptx`), 필요할 때 미리보기 |
| 발표 자료 | 장별 구성과 모션 그래픽, 키보드 탐색, 발표자가 제어하는 화면 전환 | HTML 발표 자료, PowerPoint(`.pptx`) |

기존 프로젝트는 사용하는 엔진과 파일 형식을 유지합니다. PowerPoint는 단독 시각 요소 요청도 처리하며, 내용에 맞는 도식 선택, 기존 스타일 계승, 배치 정리와 접근성, 선택적 견본 재사용을 다룹니다. [PowerPoint 전문 모듈](references/powerpoint.md)은 실제 스마트아트와 네이티브 효과에 PowerPoint 자체 자동화를 우선하고, 파일 생성만 가능한 환경에서는 도구의 지원 범위를 따릅니다. 편집 가능한 개체, 데이터와 실제 재생의 검증을 구분합니다.

## 시작하기

### 1. 스킬 설치

이 저장소 자체가 스킬 폴더입니다. 저장소 맨 위에 `SKILL.md`가 있으므로 사용할 에이전트의 설치 위치에 `chojema-visual`이라는 이름으로 두면 됩니다. 스킬 하나를 여러 에이전트에서 사용할 수 있습니다. 지침은 한국어로 쓰였지만 스킬 설명은 영어 요청도 인식하도록 작성되어 있으며, 결과는 요청한 언어로 작성합니다.

**방법 1. Git으로 설치(업데이트가 쉬움)**

```sh
git clone https://github.com/chojema/chojema-visual.git ~/.agents/skills/chojema-visual
```

업데이트는 설치 폴더에서 `git pull`을 실행합니다. 버전별 변경은 [변경 기록](CHANGELOG.md)에 있습니다.

**방법 2. zip으로 설치**

[최신 릴리스](https://github.com/chojema/chojema-visual/releases/latest)에서 `chojema-visual-<버전>.zip`을 받아 설치 위치에 풉니다. zip 안의 최상위 폴더가 이미 `chojema-visual`이므로 그대로 두면 됩니다. GitHub의 Code 메뉴에 있는 "Download ZIP"은 폴더 이름이 `chojema-visual-main`으로 풀리므로, 이 방법을 쓰면 폴더 이름을 `chojema-visual`로 바꿉니다.

설치한 위치 바로 아래에 `SKILL.md`가 있어야 합니다. `chojema-visual/chojema-visual/SKILL.md`처럼 한 단계 더 들어가지 않도록 확인합니다. 같은 이름의 기존 스킬이 있으면 먼저 내용과 변경 기록을 비교하고 설치 위치를 정합니다.

#### 에이전트별 프로젝트 설치와 사용자 전역 설치

사용자 전역은 현재 사용자의 여러 프로젝트에 적용되는 범위입니다. 시스템의 모든 사용자에게 배포하는 방법은 아래의 시스템 전역 설치를 참고합니다. `~`는 사용자 홈 폴더이며, Windows PowerShell에서는 `$HOME`으로 표시할 수 있습니다. 표는 기본 설정 기준입니다.

| 에이전트 | 특정 프로젝트에 설치 | 현재 사용자의 모든 프로젝트에 설치 | 공식 문서 |
| --- | --- | --- | --- |
| Codex | `<프로젝트>/.agents/skills/chojema-visual/` | `~/.agents/skills/chojema-visual/` | [스킬 설치와 탐색](https://learn.chatgpt.com/docs/build-skills) |
| Claude Code | `<프로젝트>/.claude/skills/chojema-visual/` | `~/.claude/skills/chojema-visual/` | [스킬 위치와 사용](https://code.claude.com/docs/en/skills) |
| Antigravity App, CLI, IDE | `<프로젝트>/.agents/skills/chojema-visual/` | `~/.gemini/config/skills/chojema-visual/` | [스킬 위치](https://antigravity.google/docs/skills) |
| OpenCode | `<프로젝트>/.opencode/skills/chojema-visual/` | `~/.config/opencode/skills/chojema-visual/` | [스킬 탐색](https://opencode.ai/docs/skills) |

Antigravity의 위 사용자 전역 경로는 App, CLI, IDE에서 함께 쓰는 경로입니다. CLI에만 적용되는 추가 경로와 이전 버전의 경로는 [공식 안내](https://antigravity.google/docs/skills)를 확인합니다. OpenCode는 호환 경로인 `.agents/skills`, `.claude/skills`와 각 사용자 홈의 같은 경로도 읽습니다. 같은 스킬을 여러 위치에 중복 설치하면 탐색 우선순위에 따라 다른 사본을 사용할 수 있으므로 사용할 위치를 정합니다. [OpenCode 탐색과 우선순위](https://opencode.ai/docs/skills)

#### 여러 에이전트에서 같은 원본 공유

프로젝트 안에서는 `.agents/skills/chojema-visual/`을 Codex, Antigravity, OpenCode의 공통 위치로 사용할 수 있습니다. Claude Code에는 `.claude/skills/chojema-visual/`에 같은 내용을 복사하거나 공통 폴더로 향하는 링크를 만듭니다. [Codex](https://learn.chatgpt.com/docs/build-skills), [Antigravity](https://antigravity.google/docs/skills), [OpenCode](https://opencode.ai/docs/skills), [Claude Code](https://code.claude.com/docs/en/skills)의 탐색 규칙을 기준으로 한 구성입니다.

사용자 전역으로 공유하려면 `~/.agents/skills/chojema-visual/`에 원본을 설치합니다. Codex와 OpenCode는 이 위치를 읽고, Claude Code와 Antigravity에는 각자의 사용자 전역 위치에서 원본을 가리키는 링크를 연결합니다. 링크를 사용하면 원본 한 곳을 수정해 같은 내용을 공유할 수 있습니다. 에이전트의 파일 접근 정책이 링크 접근을 제한하면 각 설치 위치에 복사하고 함께 갱신합니다.

아래 명령은 원본을 `~/.agents/skills/chojema-visual/`에 설치한 뒤 실행합니다. 실제로 사용하는 에이전트의 연결만 만듭니다.

**Windows PowerShell**

로컬 폴더를 연결하는 정션 예시입니다. 원본과 연결 경로를 로컬 파일 시스템에 두고, 기존 설치 폴더는 비교 후 별도로 정리합니다. `New-Item`에 덮어쓰기 옵션을 사용하지 않습니다.

```powershell
$skillTarget = (Resolve-Path -LiteralPath "$HOME/.agents/skills/chojema-visual").Path
New-Item -ItemType Directory -Force -Path "$HOME/.claude/skills", "$HOME/.gemini/config/skills" | Out-Null
New-Item -ItemType Junction -Path "$HOME/.claude/skills/chojema-visual" -Target $skillTarget
New-Item -ItemType Junction -Path "$HOME/.gemini/config/skills/chojema-visual" -Target $skillTarget
```

**macOS와 Linux**

기존 설치나 링크가 있으면 해당 위치는 건너뜁니다. 원본이 설치된 것을 확인한 뒤 심볼릭 링크를 만듭니다.

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

#### 시스템 전역 설치와 조직 배포

한 컴퓨터의 모든 사용자에게 제공하려면 관리자가 배포합니다. 기본 시스템 경로를 지원하는 경우에는 `chojema-visual` 폴더를 다음 위치에 둡니다.

| 대상 | 설치 위치 |
| --- | --- |
| Codex의 `/etc` 관리 경로를 사용하는 환경 | `/etc/codex/skills/chojema-visual/` |
| Claude Code, Linux와 WSL | `/etc/claude-code/.claude/skills/chojema-visual/` |
| Claude Code, macOS | `/Library/Application Support/ClaudeCode/.claude/skills/chojema-visual/` |
| Claude Code, Windows | `C:\Program Files\ClaudeCode\.claude\skills\chojema-visual\` |

Codex의 관리자 경로는 [OpenAI 공식 문서](https://learn.chatgpt.com/docs/build-skills), Claude Code의 기업용 스킬 배치는 [스킬 위치](https://code.claude.com/docs/en/skills)와 [운영체제별 관리 폴더](https://code.claude.com/docs/en/managed-settings)를 기준으로 합니다. 시스템 경로에 파일을 배치하려면 해당 경로의 쓰기 권한이 필요합니다.

Antigravity와 OpenCode를 포함해 여러 에이전트에 공통 배포하려면 관리자가 정한 공유 폴더에 원본을 두고, 각 사용자의 위 전역 설치 위치에 복사하거나 링크를 배포합니다. 예를 들어 Windows에서는 `C:\ProgramData\ChojemaVisual\chojema-visual\`, macOS와 Linux에서는 `/opt/chojema-visual/`을 원본 보관 위치로 정할 수 있습니다. 이 두 경로는 관리자가 선택하는 보관 위치이며, 에이전트별 탐색 경로에 연결하는 단계가 필요합니다.

공유 원본은 사용 계정에 읽기 권한을 제공하고 갱신 권한은 관리자가 관리합니다. 모든 사용자에게 적용하려면 신규 계정을 포함해 각 계정에 연결을 배포합니다. Blender, Node.js, FFmpeg 등 실행 도구의 설치와 경로 설정은 별도로 준비합니다.

#### 설치 후 인식과 호출 확인

| 에이전트 | 확인과 호출 |
| --- | --- |
| Codex CLI, IDE 확장 | `/skills` 또는 `$` 입력으로 확인하고 `$chojema-visual`로 호출. 새 스킬이 보이지 않으면 다시 시작 |
| Claude Code | `/` 메뉴에서 확인하고 `/chojema-visual`로 호출 |
| Antigravity App, CLI | `/chojema-visual`로 호출. CLI에서 새 스킬이 보이지 않으면 `/skills reload` 또는 새 대화 사용 |
| Antigravity IDE | 사이드 패널의 Customizations에서 활성 스킬을 확인하고 요청에 `chojema-visual` 사용을 명시 |
| OpenCode | 프롬프트에서 `@chojema-visual`로 호출 |

호출 방식은 각 에이전트의 위 공식 문서를 따릅니다. 스킬이 보이지 않으면 `SKILL.md`의 위치와 `name`, 중복 설치, 활성화 상태와 파일 접근 권한을 확인합니다. 이 안내는 로컬 실행 환경을 기준으로 하며, 클라우드 세션에는 해당 실행 환경에 파일과 도구가 따로 있어야 합니다.

### 2. 필요한 제작 환경 준비

하려는 작업에 필요한 도구만 준비합니다. 설치한 스킬은 제작 지침과 보조 도구를 제공하며, 실제 제작에는 로컬 실행 환경이나 연결된 편집 도구를 사용합니다.

| 작업 | 필요한 환경 |
| --- | --- |
| Blender 작업 | [Blender](https://www.blender.org/download/) 또는 사용 가능한 Blender 연결 도구 |
| HTML 발표 자료 재생 | 브라우저 |
| PowerPoint 시각 요소와 효과 | 지원 기능을 확인한 편집 연결 도구 또는 Windows Microsoft PowerPoint(COM, PowerShell이나 사용 가능한 Python COM 연결) |
| PowerPoint 기본 도형과 파일 생성 | Python과 [python-pptx](https://python-pptx.readthedocs.io/) 등 지원되는 생성 도구. 네이티브 편집과 재생 확인은 별도 환경 필요 |
| 박자표 계산 | [Node.js](https://nodejs.org/en/download) |
| 전사 기반 편집 계획 | Node.js, 시각이 있는 전사문(단어 또는 구간 단위) |
| 로컬 전사 | Whisper 지원 FFmpeg 8.0 이상과 [whisper.cpp 모델](https://huggingface.co/ggerganov/whisper.cpp), 또는 다른 로컬 전사 도구 |
| 전사 기반 영상 편집 | Node.js, [FFmpeg와 FFprobe](https://ffmpeg.org/download.html), 원본 영상과 전사문 |
| 로컬 HTML의 MP4 출력 | Node.js 22 이상, [Playwright와 Chromium](https://playwright.dev/docs/browsers), `libx264`를 지원하는 FFmpeg |
| 기존 HyperFrames, GSAP 프로젝트 | 해당 프로젝트에 설정된 실행 환경 |

Blender 견본의 Python 스크립트는 Blender 내장 Python에서 실행합니다. 세부 준비와 출력 명령은 [3D 제작](references/blender.md), [HTML 렌더링](references/rendering.md), [영상 편집](references/editing.md)에 있습니다.

### 3. 작업 요청

스킬 호출과 함께 사용할 파일, 원하는 결과와 저장 위치를 적습니다. 아래는 Codex의 `$chojema-visual`을 사용한 예시입니다. 다른 에이전트에서는 위 호출 표의 표기로 바꾸고, 파일 경로는 자신의 작업 파일 경로로 바꿉니다.

**작은 Blender 수정**

```text
$chojema-visual scene.blend의 구 하나만 지름 20 cm로 바꾸고,
scene-v2.blend로 저장해 줘.
```

**3D 애니메이션**

```text
$chojema-visual product.blend의 제품이 천천히 회전하는 6초 애니메이션을 만들어 줘.
1920×1080, 30 fps로 출력하고 .blend와 MP4를 output에 저장해 줘.
```

**제품 시연과 모션 그래픽**

```text
$chojema-visual assets의 앱 화면과 로고로 15초 제품 시연 영상을 만들어 줘.
핵심 기능을 실제 화면으로 보여 주고, 카드가 다음 장면으로 이어지게 구성해 줘.
```

**촬영본 무음 제거**

```text
$chojema-visual recording.mp4와 transcript.json으로 긴 무음을 줄여 줘.
강조를 위한 침묵은 살리고, 편집 영상과 새 시간 기준의 전사문을 output에 저장해 줘.
```

**모션 발표 자료**

```text
$chojema-visual outline.md를 바탕으로 5장짜리 HTML 발표 자료를 만들어 줘.
키보드로 넘길 수 있게 하고, 핵심 관계를 설명하는 모션 그래픽을 넣어 줘.
```

**PowerPoint 애니메이션**

```text
$chojema-visual 왼쪽 끝의 축구공이 오른쪽 끝까지 굴러가는 슬라이드를
PowerPoint 파일로 만들어 줘. 공은 편집할 수 있는 도형으로 그려 줘.
```

**기존 슬라이드의 시각 요소**

```text
$chojema-visual proposal.pptx의 3쪽 설명을 편집 가능한 흐름도로 바꿔 줘.
기존 테마와 글꼴을 따르고, 연결선과 단계별 클릭 애니메이션을 넣어 줘.
다른 슬라이드는 보존하고 output/proposal-v2.pptx로 저장해 줘.
```

실제 스마트아트가 필요하면 ‘도형 재현이 아닌 실제 스마트아트’를 지정할 수 있습니다. 전환 효과와 데이터 차트도 요청할 수 있으며, 적용과 검증은 실행 환경의 지원 범위를 따릅니다.

복합 작업에서는 촬영본 편집, 3D 장면, 2D 그래픽과 음향을 필요한 순서로 연결할 수 있습니다. 최종 파일 형식과 함께 원본 프로젝트가 필요한지도 지정하면 좋습니다.

## 작업에 맞춰 읽는 구조

[SKILL.md](SKILL.md)는 요청을 분류하고 필요한 기능 문서로 연결하는 진입점입니다. 상세 지침과 자산은 해당 작업에서 필요할 때 읽거나 사용하도록 구성되어 있습니다.

- 모델 하나를 수정할 때는 Blender 관련 지침과 결과 확인에 집중합니다.
- 여러 장면을 만들 때는 장면 시간과 자산, 전환을 함께 정리합니다.
- 복합 영상을 만들 때는 실제로 사용하는 제작 기능과 합성, 검증 절차를 연결합니다.

작업의 종류와 규모에 맞게 읽는 범위를 제한하는 설계이며, 실제 처리 시간이나 토큰 절감률을 측정한 성능 보장은 아닙니다.

## 포함된 파일

| 경로 | 내용 |
| --- | --- |
| [SKILL.md](SKILL.md) | 스킬 식별자, 작업 선택과 공통 제작 지침 |
| [agents/openai.yaml](agents/openai.yaml) | 표시 이름과 기본 호출 문구 |
| `references/` | 3D, 2D 모션, 제품 영상, 쇼릴, 편집, PowerPoint 시각 요소, 발표 자료, 렌더링, 오디오 지침 |
| `scripts/` | HTML 영상 렌더러, 전사 기반 편집, 박자표 계산 도구 |
| `assets/` | HTML 영상과 발표 자료 견본, Blender 장면 견본, 서식, 합성 오디오, 한국어 글꼴 3종(Pretendard, Gowun Batang, Gowun Dodum. 용도는 [실행 환경과 자료 출처](references/sources.md)) |
| [tests/helpers.test.mjs](tests/helpers.test.mjs) | 편집, 전사 변환, 박자표, HTML 렌더러, Blender 견본의 자동 검사 |
| [LICENSE](LICENSE) | MIT 라이선스 |
| [CHANGELOG.md](CHANGELOG.md) | 버전별 변경 기록 |
| [README.md](README.md) / [README.en.md](README.en.md) | 한국어 / 영어 설치와 사용 안내 |

### 보조 도구 직접 실행

명령은 이 README가 있는 폴더에서 실행합니다. 실제 작업의 파일은 별도 프로젝트 폴더에 둡니다.

| 도구 | 역할 |
| --- | --- |
| [render-html.mjs](scripts/render-html.mjs) | 프레임 출력 계약을 따르는 로컬 HTML을 MP4로 렌더링 |
| [cut-silences.mjs](scripts/cut-silences.mjs) | 단어별 전사 시각을 바탕으로 긴 무음 구간을 줄임 |
| [apply-cuts.mjs](scripts/apply-cuts.mjs) | 검토한 삭제 구간을 적용하고 전사문의 시각을 재배치 |
| [media-edit.mjs](scripts/media-edit.mjs) | 두 편집기가 공유하는 입력 검증, 시간표 처리와 출력 보호 |
| [whisper-transcript.mjs](scripts/whisper-transcript.mjs) | FFmpeg·whisper.cpp 등의 Whisper 출력을 편집 도구의 전사문으로 변환 |
| [beatgrid.mjs](scripts/beatgrid.mjs) | 일정한 박자 간격으로 장면의 시간과 프레임 범위를 계산 |

박자표 계산 예시입니다. 이 도구는 음악 파일의 박자를 분석하지 않으므로 BPM이나 박자 간격은 별도로 확인합니다.

```sh
node scripts/beatgrid.mjs --bpm 120 --fps 30 --length 8 --chapters "도입:4,변형:8,마무리:rest"
```

직접 실행하는 다섯 도구의 옵션은 `--help`로 확인할 수 있습니다. `media-edit.mjs`는 편집기 내부에서 사용합니다. 편집 도구는 기본적으로 계획 파일을 만들고, `--apply`를 지정했을 때 실제 영상을 생성합니다. 입력 형식과 실행 예시는 [영상 편집 지침](references/editing.md)을 참고합니다.

### 견본 보기

저장소를 내려받은 뒤 [영상 견본](assets/demo.html) 또는 [발표 자료 견본](assets/slides.html)을 브라우저에서 엽니다. 글꼴과 오디오가 상대 경로로 연결되어 있으므로 `assets` 폴더의 구조를 유지합니다.

발표 자료 견본은 방향키, Page Up, Page Down, Home, End와 화면 버튼으로 탐색할 수 있습니다. 모션 감소 설정과 인쇄 레이아웃도 포함합니다. 견본에 사용한 제품과 문구는 가상의 예시입니다.

## 검증

```sh
node --test tests/helpers.test.mjs
```

자동 검사는 박자표 범위, 삭제 구간 병합, 전사문 시간 재배치, 연속 편집, Whisper 출력 변환, 렌더러 인자 검증, 입력 검증과 기존 파일 보호를 확인합니다. FFmpeg가 있으면 합성 영상의 실제 편집과 출력 스트림, 길이도 검사하며, 없으면 해당 실행 검사를 건너뜁니다. `CHOJEMA_PLAYWRIGHT`(Playwright 패키지 경로)와 필요하면 `CHOJEMA_BROWSER`(헤드리스 Chromium 실행 파일)를 지정하면 HTML 렌더러의 실제 MP4 출력도 검사합니다. `CHOJEMA_BLENDER`에 `blender.exe` 경로(`blender-launcher.exe` 아님)를 지정하면 Blender 견본 장면의 생성과 렌더도 검사합니다.

버전 1.3.1, 2026. 11. 09. 기준으로 다음 범위를 확인했습니다.

| 구분 | 확인한 범위 |
| --- | --- |
| 자동 검사 | 17개 검사 통과. FFmpeg 실제 편집, HTML 렌더러 MP4 출력, Blender 견본 렌더 포함 |
| 로컬 전사 | 합성 음성 → FFmpeg 8.0 `whisper` 필터(large-v3-turbo) → 전사문 변환 → 무음 제거 MP4 출력 |
| 스킬 구성 | 메타데이터, 단일 진입점, 로컬 문서와 자산 참조 연결 |
| HTML 발표 자료 | 버튼과 키보드 탐색 후 등장 내용 표시, 처음과 끝 경계, 모션 감소, 인쇄, 모바일 배치 |
| HTML 영상 | 장면 경계, 같은 프레임의 재현, 소규모 MP4 출력, 한국어 글꼴 3종 로컬 로드와 렌더 |
| PowerPoint 16.0(Microsoft 365) | python-pptx로 만든 도형 그룹의 이동 경로와 회전 애니메이션 인식, 영상 내보내기로 시작·중간·끝 위치와 회전 확인 |
| Blender 5.2.3 LTS | 견본 장면 생성, EEVEE 미리보기와 72프레임 전체 렌더, BT.709 MP4 인코딩, 재질 색과 회전 확인 |

별도 HyperFrames 프로젝트 제작과 macOS의 PowerPoint 재생은 이 검증에 포함하지 않았습니다. PowerPoint는 이동 경로와 회전만 확인했으므로 다른 애니메이션 효과는 실제 작업 환경에서 확인해야 합니다.

버전 1.4.0의 PowerPoint 전문 모듈은 2026. 11. 09.에 PowerPoint 16.0과 Python 3.13 COM 경로로 추가 확인했습니다. 실제 스마트아트와 한글 문구, 도형 이동 후 연결선 유지, 내장 차트 데이터와 값 보존, 도형 병합, 애니메이션과 전환의 저장·재열기, 창 모드 슬라이드 쇼의 클릭 진행 등 주요 검사 12개가 통과했고 정지 렌더 4장을 확인했습니다. 초기 PowerShell COM 시험은 완료하지 못해 Python 경로로 전환했으며, PowerShell 경로 전체를 검증한 것은 아닙니다.

모핑, 모든 효과와 스마트아트 레이아웃, 개체 클릭 트리거, SVG 경로 편집, 기존 복합 자료의 스타일 계승, 접근성 UI, 다른 운영체제와 에이전트의 실제 스킬 재로딩은 미검증입니다. 이 모듈은 제작 지침이며 작업마다 사용 가능한 도구로 수행합니다. 패키지 기본 자동 검사 17개 중 15개가 통과했고 HTML 실제 렌더와 Blender 검사 2개는 환경 변수를 지정하지 않아 건너뛰었습니다. 위 1.3.1의 전체 렌더 검증 기록과 구분합니다.

## 자료와 결과물 관리

원본을 보존하고 결과는 별도 경로에 저장하는 것을 기본으로 합니다. 포함된 렌더러와 편집 도구는 기존 출력 파일을 덮어쓰지 않습니다. 실행이 중단된 뒤 다시 작업할 때도 결과 경로를 확인합니다.

실제 제품의 로고, 화면과 기능은 제공된 자료를 기준으로 사용합니다. 음악, 음성, 사진과 모델은 사용할 수 있는 자료를 준비합니다. HTML 발표 자료, 편집 가능한 PowerPoint와 발표 녹화 영상은 서로 다른 결과물이므로 필요한 형식을 지정합니다.

포함된 글꼴을 결과물에 넣을 때는 그 글꼴의 OFL 고지 파일을 같은 폴더에 함께 둡니다([라이선스](#라이선스)). 글꼴별 용도와 굵기, 실행 환경과 포함 자산은 [실행 환경과 자료 출처](references/sources.md)에 있습니다.

## 라이선스

문서, 스크립트와 견본은 [MIT 라이선스](LICENSE)로 제공합니다.

포함된 글꼴은 MIT 라이선스의 적용 대상이 아니며, 각 글꼴의 SIL Open Font License 1.1을 따릅니다.

| 글꼴 | 저작권 | 라이선스 고지 |
| --- | --- | --- |
| Pretendard | Kil Hyung-jin | [Pretendard-OFL.txt](assets/fonts/Pretendard-OFL.txt) |
| Gowun Batang | The Gowun Batang Project Authors(디자이너 류양희) | [GowunBatang-OFL.txt](assets/fonts/GowunBatang-OFL.txt) |
| Gowun Dodum | The Gowun Dodum Project Authors(디자이너 류양희) | [GowunDodum-OFL.txt](assets/fonts/GowunDodum-OFL.txt) |
