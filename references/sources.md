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

Pretendard 글꼴은 원본 파일과 [OFL 고지](../assets/fonts/Pretendard-OFL.txt)를 함께 보존한다. 견본의 제품과 문구는 가상의 예시다. 스킬의 문서, 스크립트와 견본은 [MIT 라이선스](../LICENSE)를 따르며 글꼴은 OFL 1.1을 따른다. 사용자가 제공한 자산과 외부 도구에는 해당 사용 조건이 적용된다.

공식 도구 문서는 기능별 참조 문서에 연결한다. 구체적인 옵션과 버전 차이는 설치 환경의 도움말과 공식 문서로 확인한다.

## 포함된 도구의 검사

스킬 폴더에서 실행한다. 기본 검사는 Node.js를 사용하며 FFmpeg가 있으면 합성 영상의 실제 편집까지 검사한다. `CHOJEMA_PLAYWRIGHT`에 Playwright 패키지 경로를(필요하면 `CHOJEMA_BROWSER`에 헤드리스 Chromium 실행 파일을) 지정하면 HTML 렌더러의 실제 MP4 출력도 검사한다. `CHOJEMA_BLENDER`에 `blender.exe` 경로를 지정하면 Blender 견본 장면의 생성과 렌더도 검사한다.

```text
node --test tests/helpers.test.mjs
```

이 검사는 편집, 전사 변환, 박자표, HTML 렌더러, Blender 견본을 확인한다. HyperFrames 프로젝트, PowerPoint 출력, 실제 작업의 제작 품질이나 시간과 토큰 비용까지 검증하는 것은 아니다.
