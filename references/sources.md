# 실행 환경과 자료 출처

이 패키지는 설치 가능한 스킬 하나다. 기능별 문서와 로컬 도구를 필요한 작업에서만 사용한다. 다른 스킬을 추가로 설치할 필요는 없다.

## 실행 도구

| 작업 | 필요한 환경 |
| --- | --- |
| Blender 모델과 장면 | 사용 가능한 Blender 연결 도구 또는 Blender 실행 파일 |
| 로컬 HTML을 MP4로 출력 | Node.js, Playwright와 Chromium, FFmpeg |
| 전사 기반 편집 | Node.js, 실제 편집 시 FFmpeg와 FFprobe |
| 로컬 전사 | Whisper 지원 FFmpeg(8.0 이상)와 whisper.cpp 모델 파일, 또는 다른 로컬 전사 도구 |
| 박자표 계산 | Node.js |
| HTML 발표 자료 | 브라우저 |

`scripts/cut-silences.mjs`와 `scripts/apply-cuts.mjs`는 `media-edit.mjs`의 입력 검증, 시간표 계산, 파일 보호와 FFmpeg 출력을 공유한다. `whisper-transcript.mjs`는 Whisper 출력을 편집 도구의 전사문 형식으로 바꾼다. `beatgrid.mjs`는 일정한 박자 간격을 프레임 표로 계산한다. 실행 옵션은 각 도구의 `--help`로 확인한다.

무음 제거는 `--gap`(기본 0.55초) 이상의 단어 간격만 0.2초까지 줄이고 양쪽에 같은 여유를 남긴다. 사용자가 지정한 `--gap`이 0.2초보다 짧으면 그 값을 남긴다. 앞뒤 패딩은 별도 옵션을 따른다. 강조를 위한 침묵과 발화 문맥은 실제로 들어 보고 검토한다.

## 포함한 견본과 글꼴

`assets`에는 HTML 영상 견본(`demo.html`)과 로컬에서 합성한 견본 오디오, HTML 발표 자료 견본, Blender 새 장면 견본, 스토리보드와 오디오 큐 서식, 글꼴이 있다. 모두 수정해 쓰는 출발점이다.

견본의 제품과 문구는 가상의 예시다. 스킬의 문서, 스크립트와 견본은 [MIT 라이선스](../LICENSE)를 따르며 글꼴은 각각의 OFL 1.1 고지를 따른다.

## 한국어 글꼴

`assets/fonts`의 세 글꼴은 모두 SIL OFL 1.1이다. 결과물 프로젝트에 복사할 때는 쓰는 글꼴의 OFL 고지 파일을 같은 폴더에 함께 둔다. 글꼴만 따로 판매하지 않는다.

| 글꼴 | 파일 | 굵기 | 어울리는 곳 | 고지 |
| --- | --- | --- | --- | --- |
| Pretendard | `PretendardVariable.woff2` | 45~920 가변 | 기본값. UI, 표와 숫자, 키네틱 타이포처럼 굵기 변화가 필요한 곳 | [Pretendard-OFL.txt](../assets/fonts/Pretendard-OFL.txt) |
| Gowun Batang | `GowunBatang-Regular.woff2`, `GowunBatang-Bold.woff2` | 400, 700 | 큰 제목, 인용문, 감성 문구, 표지와 장 제목처럼 천천히 읽히는 글 | [GowunBatang-OFL.txt](../assets/fonts/GowunBatang-OFL.txt) |
| Gowun Dodum | `GowunDodum-Regular.woff2` | 400 | 따뜻한 본문, 자막, 짧은 설명 문구 | [GowunDodum-OFL.txt](../assets/fonts/GowunDodum-OFL.txt) |

Gowun 글꼴은 굵기가 적으므로 지원하지 않는 굵기를 지정하지 않는다. 브라우저가 가짜 굵게나 기울임을 만들지 않도록 `font-synthesis: none`을 둔다. 한 화면에는 제목용과 본문용 두 글꼴까지만 섞는다. 사용자가 브랜드 글꼴을 지정했으면 그 글꼴을 우선한다.

```css
@font-face { font-family: "Gowun Batang"; src: url("fonts/GowunBatang-Regular.woff2") format("woff2"); font-weight: 400; font-display: block; }
@font-face { font-family: "Gowun Batang"; src: url("fonts/GowunBatang-Bold.woff2") format("woff2"); font-weight: 700; font-display: block; }
@font-face { font-family: "Gowun Dodum"; src: url("fonts/GowunDodum-Regular.woff2") format("woff2"); font-weight: 400; font-display: block; }
```

프레임 렌더에서는 `document.fonts.load('700 64px "Gowun Batang"')`처럼 실제로 쓰는 굵기를 읽은 뒤 그린다. Blender 텍스트 객체는 WOFF2를 읽지 못하므로, 사용자가 TTF를 제공하지 않았으면 아래 출처에서 원본 TTF를 받아 결과물 프로젝트에 고지와 함께 둔다.

출처: Google Fonts 저장소 `google/fonts`의 `ofl/gowunbatang`, `ofl/gowundodum`(커밋 c1eda9233c33). 디자이너는 류양희이며 원본 프로젝트는 [Gowun Batang](https://github.com/yangheeryu/Gowun-Batang), [Gowun Dodum](https://github.com/yangheeryu/Gowun-Dodum)이다. TTF를 fontTools로 WOFF2로만 변환했고 글리프와 문자 대응은 원본과 같다. 사용자가 제공한 자산과 외부 도구에는 해당 사용 조건이 적용된다.

공식 도구 문서는 기능별 참조 문서에 연결한다. 구체적인 옵션과 버전 차이는 설치 환경의 도움말과 공식 문서로 확인한다.

## 포함된 도구의 검사

스킬 폴더에서 실행한다. 기본 검사는 Node.js를 사용하며 FFmpeg가 있으면 합성 영상의 실제 편집까지 검사한다. `CHOJEMA_PLAYWRIGHT`에 Playwright 패키지 경로를(필요하면 `CHOJEMA_BROWSER`에 헤드리스 Chromium 실행 파일을) 지정하면 HTML 렌더러의 실제 MP4 출력도 검사한다. `CHOJEMA_BLENDER`에 `blender.exe` 경로를 지정하면 Blender 견본 장면의 생성과 렌더도 검사한다.

```text
node --test tests/helpers.test.mjs
```

이 검사는 편집, 전사 변환, 박자표, HTML 렌더러, Blender 견본을 확인한다. HyperFrames 프로젝트, PowerPoint 출력, 실제 작업의 제작 품질이나 시간과 토큰 비용까지 검증하는 것은 아니다.
