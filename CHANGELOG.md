# 변경 기록

## 1.3.1 (2026-11-09)

- README의 글꼴 라이선스 안내를 라이선스 섹션 한 곳으로 모았다. 글꼴별 저작권자와 고지 파일을 표로 정리하고, 자료와 결과물 관리 섹션에는 고지 파일을 함께 두라는 규칙과 링크만 남겼다. 영문 README도 같게 정리했다.
- `references/sources.md`에 Pretendard의 예약 글꼴 이름(Reserved Font Name) 규칙을 추가했다. 수정한 파일은 Pretendard라는 이름으로 배포하지 않는다.

## 1.3.0 (2026-11-09)

- `references/presentations.md`에 PowerPoint 기본 애니메이션 제작 방법을 넣었다. python-pptx로 편집 가능한 도형을 만들고 `p:timing` XML로 이동 경로와 회전을 넣는 실행 예시, 단위 규칙(슬라이드 비율 좌표, 각도 × 60000, 굴림 회전각), 자동·클릭 시작 구조, PowerPoint COM으로 애니메이션 목록 확인과 영상 내보내기를 포함한다.
- README의 할 수 있는 작업, 제작 환경, 요청 예시, 검증 범위에 PowerPoint를 반영했다.

## 1.2.0 (2026-11-09)

- 한국어 글꼴 Gowun Batang(400, 700)과 Gowun Dodum(400)을 OFL 1.1 고지와 함께 추가했다. Google Fonts 원본 TTF를 WOFF2로만 변환해 세 파일이 약 1.4MB다.
- 글꼴 용도 기준(기본 Pretendard, 제목·인용 Gowun Batang, 본문·자막 Gowun Dodum)과 선언 예시를 `SKILL.md`와 `references/sources.md`에 넣었다.
- 모든 글꼴에 OFL 고지가 있는지 확인하는 테스트를 추가했다.
- 영문 README(`README.en.md`)를 추가하고 두 README에 언어 전환 링크를 넣었다.

## 1.1.2 (2026-11-09)

- `LICENSE`를 표준 MIT 문구만 남겨 GitHub이 MIT로 인식하게 했다. 글꼴의 OFL 1.1 안내는 README, `references/sources.md`, `assets/fonts/Pretendard-OFL.txt`에 있다.

## 1.1.1 (2026-11-09)

- HTML 렌더러와 Blender MP4 명령의 색 태그가 FFmpeg 7 이상에서 `unknown`이나 sRGB로 남던 문제를 `setparams`로 고쳤다. 픽셀은 그대로이고 태그만 BT.709로 확정된다.
- 최상위에 `.gitignore`, `.gitattributes`를 추가했다.

## 1.1.0 (2026-11-09)

- 영어 요청도 인식하도록 스킬 설명을 영어로 작성하고 한국어 키워드를 함께 넣었다. 결과물은 요청한 언어로 작성한다.
- Whisper 출력을 편집용 전사문으로 바꾸는 `scripts/whisper-transcript.mjs`를 추가했다.
- 편집 도구에 `--ffmpeg`, `--ffprobe` 옵션을 추가하고, FFmpeg 7 이상에서는 폐기 예정인 `-filter_complex_script` 대신 `-/filter_complex`를 쓴다.
- 발표 자료 견본에서 장을 넘기면 등장 내용이 투명하게 남던 버그를 고쳤다.
- Blender 견본의 재질 색이 렌더에 적용되지 않던 버그와 `World.use_nodes` 폐기 경고를 고치고, 회전 루프를 등속 무이음매로 바꿨다.
- 음량 정규화의 true peak 목표를 AAC 재인코딩 여유를 둔 -1.5로 조정했다.
- 스킬 파일을 개발 기록과 분리된 폴더로 정리하고 MIT 라이선스를 추가했다.
- 테스트를 16개로 늘렸다(전사 변환, HTML 렌더러, Blender 견본, FFmpeg 경로 지정 포함).

## 1.0.0 (2026-11-08)

- 최초 버전.
