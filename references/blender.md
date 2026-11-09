# Blender 3D 제작

## 단독 모델링, 재질, 조명과 정지 이미지

요청한 물체나 기존 장면의 해당 부분만 작업한다. 영상 기획, 스토리보드, FFmpeg, 사운드는 필요하지 않다. `.blend`나 정지 이미지만 요청했으면 그것으로 마친다.

제공된 모델과 장면을 우선 사용하고 단위와 치수, 축, 원점, 필요한 내보내기 형식을 맞춘다. 사진으로 모델링하면 실루엣과 비율을 비교하고 확인할 수 없는 부분은 가정으로 구분한다. 재질과 조명은 요청한 표면과 형태가 읽히도록 구성한다. 단순 모델에도 제품 광고용 카메라나 브랜드를 넣지 않는다.

사용 가능한 Blender 연결 도구가 있으면 그 기능을 사용한다. CLI는 실행 파일을 확인하고 필요한 경우 절대 경로로 호출한다. PATH에 없으면 기본 설치 위치(Windows는 `Program Files\Blender Foundation\Blender <버전>`)를 찾는다. Windows에서는 `blender-launcher.exe`가 아닌 같은 폴더의 `blender.exe`를 쓴다. 런처는 콘솔 출력과 종료 코드를 돌려주지 않는다. 재질 색은 렌더 셰이더(Principled BSDF의 Base Color)에 넣는다. `diffuse_color`는 뷰포트 표시에만 쓰인다. 기존 `.blend`는 자동 스크립트를 끈 상태에서 열고 다른 경로로 저장한다. 사용자가 준 스크립트는 실행 전에 내용을 검토한다. 새 장면 스크립트에만 `--factory-startup`을 사용하며, 원본 수정 작업에서 초기화하지 않는다.

단독 작업도 저장 파일을 다시 열어 객체, 재질, 외부 텍스처와 요청한 치수를 확인한다. 정지 이미지를 만들면 실제 렌더를 열어 본다. 저장 성공과 시각 검증을 구분한다.

## 3D 애니메이션

시작과 끝 자세, 카메라, 프레임 범위와 fps를 정한다. 기존 장면은 기존 타임라인을 유지한다. 새 숏은 간단한 프레임 표로 충분하며, 여러 장면을 연결할 때만 전체 스토리보드가 필요하다.

[build-scene.py](../assets/build-scene.py)는 회전하는 상자와 카메라, 조명을 만드는 새 장면용 견본이다. Blender 내장 Python으로 실행하며 `bpy`를 일반 Python에 설치하지 않는다. 이 견본은 프레임 1~72, 24 fps, 960×540이며 실제 작업에 맞춰 수정한다. 기존 파일이 있으면 새 경로를 사용한다.

```text
blender -b --factory-startup --disable-autoexec --python-exit-code 1 --python "<skill>/assets/build-scene.py" -- scene-v1.blend
blender -b --disable-autoexec scene-v1.blend -o //preview/frame_#### -F PNG -x 1 -f 1,36,72
```

출력 폴더를 미리 만들고 대표 자세와 전환 경계를 낮은 해상도나 샘플 수로 확인한다. 카메라 크롭, 관통, 그림자, 재질과 라벨 위치를 수정한 뒤 전체를 렌더한다. 지원 렌더 엔진과 속성은 설치된 Blender의 도움말과 API에서 확인한다.

```text
blender -b --disable-autoexec scene-v1.blend -o //frames/frame_#### -F PNG -x 1 -s 1 -e 72 -a
ffmpeg -n -framerate 24 -start_number 1 -i frames/frame_%04d.png -frames:v 72 -vf scale=out_color_matrix=bt709:out_range=tv,setparams=color_primaries=bt709:color_trc=bt709:colorspace=bt709:range=tv -c:v libx264 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv shot-v1.mp4
```

새 렌더 폴더에서 시작하고 중단된 작업은 존재하는 프레임을 확인해 누락 구간만 이어 간다. 0부터 시작하는 외부 `[0, N)` 구간은 새 Blender 숏의 1~N 프레임에 대응한다. 기존 장면의 프레임 시작이 다르면 오프셋을 기록한다.

## 다른 장면과 합성할 때만

투명 배경은 Film Transparent와 PNG RGBA로 출력한다. 알파가 필요한 시퀀스를 불투명 MP4로 먼저 바꾸지 않는다. 합성할 레이어의 비율, fps, 해상도와 색을 맞춘다.

실사와 연결할 때는 실제 접합 프레임을 뽑아 물체 위치, 크기, 회전, 카메라 각도와 광원 방향을 맞춘다. 전환 앞뒤의 중복, 속도와 색 변화를 확인한다. 음향이 필요할 때만 [오디오](audio.md), 별도 편집이 필요할 때만 [영상 편집](editing.md)을 읽는다.

공식 자료: [Blender 명령줄 렌더링](https://docs.blender.org/manual/en/latest/advanced/command_line/render.html), [Blender Python API](https://docs.blender.org/api/current/).
