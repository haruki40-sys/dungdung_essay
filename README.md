# 둥둥이의 에세이 보관함

GitHub Pages에 바로 올릴 수 있는 정적 웹사이트 패키지입니다.

## 구성

- `index.html`: 메인 페이지
- `style.css`: 전체 디자인
- `essays/`: 에세이 개별 페이지
- `assets/audio/`: 에세이별 음악 파일을 넣는 폴더
- `.nojekyll`: GitHub Pages에서 정적 파일을 그대로 배포하기 위한 파일

## 음악 파일 넣는 법

아래 파일명으로 음악을 넣으면 각 에세이 페이지에서 자동으로 연결됩니다.

- `assets/audio/essay-1.mp3` 또는 `essay-1.wav`: 익숙함의 중력
- `assets/audio/essay-2.mp3` 또는 `essay-2.wav`: 닳아버린 마루 위의 사랑
- `assets/audio/essay-3.mp3` 또는 `essay-3.wav`: AI 딸깍 이후의 글
- `assets/audio/essay-4.mp3` 또는 `essay-4.wav`: 물타기 전에 찬물부터

## GitHub Pages 배포 방법

1. GitHub에서 새 repository를 만듭니다. 예: `dungdung-essay-archive`
2. 이 ZIP 안의 파일을 전부 repository 최상단에 업로드합니다.
3. Settings → Pages로 이동합니다.
4. Build and deployment에서 Source를 `Deploy from a branch`로 선택합니다.
5. Branch를 `main` / `/root`로 선택하고 Save를 누릅니다.
6. 잠시 뒤 표시되는 Pages 주소로 접속합니다.

## 주의

- 음악 파일은 저작권 문제가 없는 직접 제작 음원만 올리는 것이 안전합니다.
- GitHub 저장소를 Public으로 만들면 누구나 볼 수 있습니다.
