# 사운드 제작과 합성

최종 영상의 프레임을 기준으로 `audio-cues.md`를 작성한다. 큐마다 시작 프레임과 시간, 파일명, 역할, 편집 범위, 상대 볼륨을 기록한다. 합성한 효과음은 만든 명령을, 외부 파일은 출처와 사용 조건을 제작 기록에 남긴다.

## 효과음

- 소리가 날 법한 동작을 먼저 고른다. 버튼을 누르는 프레임에는 짧은 클릭, 모양이 변형되는 프레임에는 이동 소리, 결과가 드러나는 프레임에는 짧은 포인트를 준다. 정지 화면마다 효과음을 붙이기보다 중요한 상태 변화의 타이밍을 확인한다.
- UI 효과음은 로컬에서 합성할 수 있다. 길이와 시작 시점을 프레임에 맞추기 쉽다. 잡음 합성에는 시드를 고정해 반복 생성의 차이를 줄인다. 아래 명령은 48 kHz 스테레오 WAV를 만든다. 주파수, 길이, 감쇠 속도를 바꿔 제품의 톤에 맞춘다.

```text
# 클릭: 버튼 누름
ffmpeg -n -f lavfi -i "anoisesrc=d=0.03:c=white:r=48000:a=0.8:seed=42" -af "highpass=f=2000,afade=t=out:st=0:d=0.03" -ac 2 click.wav
# 이동 소리: 형태 변형, 화면 이동
ffmpeg -n -f lavfi -i "anoisesrc=d=0.6:c=pink:r=48000:a=0.6:seed=42" -af "bandpass=f=1200:w=1.5,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.25" -ac 2 whoosh.wav
# 팝: 배지, 카드 등장
ffmpeg -n -f lavfi -i "aevalsrc='0.8*sin(2*PI*(600*t-400*t*t))*exp(-25*t)':s=48000:d=0.15" -ac 2 pop.wav
# 차임: 결과 표시, 행동 유도 화면
ffmpeg -n -f lavfi -i "aevalsrc='0.5*(sin(2*PI*880*t)+0.6*sin(2*PI*1320*t))*exp(-6*t)':s=48000:d=0.8" -ac 2 chime.wav
```

- 합성한 소리는 직접 들어 보고 고른다. 소리가 날카로우면 고역 통과 주파수를 낮추고, 꼬리가 길게 남으면 감쇠를 빠르게 한다.
- 발소리, 유리, 실내 공기감처럼 사실적인 소리는 합성으로 품질을 내기 어렵다. 사용자가 제공했거나 사용 조건이 확인된 효과음 파일을 쓰고, 없으면 큐 시트에 필요한 소리와 길이를 적어 둔다.

## 내레이션과 음악

- 숏별로 말이 들어갈 시간을 먼저 정하고 그 안에 들어가는 분량의 대본을 쓴다. 사용자가 녹음했거나 제공한 음성 파일의 실제 재생 시간을 측정한다. 길면 문구를 덜거나 쉬는 시간을 조정한다. 본인 또는 사용 권한이 확인된 목소리만 쓴다.
- 음악은 사용자가 제공했거나 사용 조건이 확인된 음원만 쓴다. 음원의 길이와 박자를 직접 확인하고 영상 끝에 맞춰 편집한다.
- 녹음이나 음원이 없으면 녹음용 대본과 타임코드가 있는 큐 시트를 제공한다. 음악 큐에는 분위기, 악기, 템포, 목표 길이, 끝맺음을 적는다. 음악 없이 효과음만으로 구성해도 된다.

## 자막 시점

자막이 필요하면 최종 녹음을 기준으로 시점을 찍는다. FFmpeg 8.0 이상이 Whisper 지원으로 빌드되어 있으면 `whisper` 필터로 SRT 초안을 만들 수 있다. 먼저 필터가 있는지 확인하고, whisper.cpp 모델 파일의 경로를 지정한다. 인식된 문구는 대본으로 바로잡고 시점만 참고한다. 필터가 없으면 파형을 보며 시점을 직접 찍는다.

```text
ffmpeg -hide_banner -filters
ffmpeg -i voice.wav -vn -af "whisper=model=<모델 경로>/ggml-base.bin:language=ko:queue=10:destination=voice.srt:format=srt" -f null -
```

## 로컬 믹스 예시

아래 예시는 8초 무음 MP4에 음성, 음악, 효과음을 섞는다. 음성은 0.35초, 효과음은 2.20초에서 시작한다. 프로젝트마다 `adelay`의 밀리초, 음악의 페이드 시작점과 `atrim` 길이를 바꾼다. 입력마다 스테레오 48 kHz로 맞춘 뒤 믹스하고, 짧은 소스도 영상 끝까지 무음으로 채운다. 음성이 있는 대목은 음악을 먼저 낮춰 알아듣기 쉽게 만든다.

```text
ffmpeg -n -i silent.mp4 -i voice.wav -i music.wav -i hit.wav -filter_complex "[1:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=350:all=1,volume=0.8[voice];[2:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.16,afade=t=out:st=7.5:d=0.5[bed];[3:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=2200:all=1,volume=0.45[hit];[voice][bed][hit]amix=inputs=3:normalize=0,apad,atrim=duration=8,alimiter=limit=0.9:level=0:latency=1[mix]" -map 0:v:0 -map "[mix]" -c:v copy -c:a aac -b:a 192k -movflags +faststart mixed.mp4
```

없는 소스는 해당 입력과 필터 줄을 빼고 `amix` 개수와 입력 번호를 맞춘다. 배경음이 짧으면 음악의 구절을 이어 편집하거나 자연스럽게 끝낸다.

## 음량 맞추기

게시 플랫폼이 음량 기준을 정해 두었으면 그 기준을 따른다. 기준이 없으면 통합 음량 -14 LUFS, true peak -1 dBTP를 기본 목표로 삼는다. 온라인 영상에서 흔히 쓰는 값이지만 플랫폼 정책은 바뀔 수 있다. AAC로 다시 인코딩하면 true peak가 0.1~0.5 dB 오르므로 `loudnorm`의 TP는 목표보다 0.5 dB 낮은 -1.5로 둔다. 믹스한 파일을 두 번 처리한다. 첫 명령으로 측정하고, 출력된 `input_i`, `input_tp`, `input_lra`, `input_thresh`, `target_offset` 값을 두 번째 명령에 넣는다. 마지막 명령으로 결과를 다시 잰다.

```text
ffmpeg -hide_banner -i mixed.mp4 -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
ffmpeg -n -i mixed.mp4 -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true,aresample=48000" -c:v copy -c:a aac -b:a 192k -movflags +faststart final.mp4
ffmpeg -hide_banner -i final.mp4 -af ebur128=peak=true -f null -
```

마지막 측정의 true peak가 목표(-1 dBTP)를 넘으면 TP를 더 낮춰 다시 처리한다. `loudnorm`은 내부에서 표본화율을 높이므로 `aresample=48000`으로 되돌린다. 효과음만 드문드문 있는 짧은 영상은 음량 범위가 넓어 선형 처리 대신 동적 처리로 넘어갈 수 있다. 측정값과 함께 직접 들어 보고, 내레이션 명료도, 효과음의 시작 시점, 음악의 끝도 확인한다.

[FFmpeg 오디오 필터 문서](https://ffmpeg.org/ffmpeg-filters.html)
