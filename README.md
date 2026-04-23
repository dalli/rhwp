<div align="center">
  <img src="assets/logo/logo-128.png" alt="rhwp logo" width="128" />
  <h1>rhwp Desktop</h1>
  <p><strong>Windows, macOS, Linux를 모두 지원하는 빠르고 가벼운 HWP/HWPX 뷰어 및 에디터</strong></p>
</div>

## ✨ 소개
`rhwp Desktop`은 Rust와 WebAssembly(WASM) 기반의 초고속 HWP 파싱 엔진을 품은 **크로스 플랫폼 데스크톱 애플리케이션**입니다. 
Tauri 프레임워크를 활용하여 기존 웹 브라우저의 한계를 극복하고, 네이티브 앱 수준의 속도와 OS 통합 경험을 제공합니다.

## 🚀 주요 기능
* **크로스 플랫폼 지원**: Windows(`.msi`), macOS(`.dmg`), Linux(`.AppImage`) 완벽 지원
* **네이티브 파일 시스템 I/O**: 웹 브라우저 샌드박스를 벗어나 OS 기본 다이얼로그를 통한 빠르고 자유로운 로컬 파일 열기/저장
* **시스템 폰트 자동 감지**: 사용자 PC에 설치된 폰트를 캔버스 렌더링에 즉시 반영하여 웹 폰트 다운로드 대기 시간 제로화 (Zero-latency)
* **초고속 렌더링**: Rust 백엔드 처리와 WASM 기반 프론트엔드 연산으로 대용량 문서도 빠르게 렌더링
* **자동 업데이트**: GitHub Releases와 연동된 내장 Auto Updater를 통해 항상 최신 버전 유지

## 📥 설치 및 실행 방법

최신 릴리즈는 [GitHub Releases](https://github.com/dalli/rhwp/releases) 페이지에서 다운로드할 수 있습니다. 운영체제에 맞는 설치 파일을 받아 설치해 주세요.

### 🍎 macOS 사용자 참고 (실행 파일 손상 경고 우회)
현재 개발 버전을 인터넷에서 직접 다운로드하여 설치할 경우, Apple의 서명/공증 절차가 적용되지 않아 macOS의 Gatekeeper가 `앱이 손상되었으므로 휴지통으로 이동해야 합니다`라는 경고를 표시할 수 있습니다. 
이 경우 터미널을 열고 아래 명령어를 입력하여 보안 격리 속성을 해제한 후 실행해 주세요:
```bash
xattr -cr /Applications/rhwp.app
```
*(앱을 다른 경로에 복사하셨다면 `/Applications/rhwp.app` 대신 해당 위치의 경로를 입력해 주세요.)*

## 🛠️ 개발 환경 설정 및 빌드

이 프로젝트를 로컬에서 직접 빌드하거나 기여하고 싶으시다면 다음 단계를 따르세요.

### 1. 요구 사항 (Prerequisites)
- [Node.js](https://nodejs.org/) (v20 이상 권장)
- [Rust](https://rustup.rs/) (Stable 버전)
- OS별 데스크톱 개발 환경 (C++ 컴파일러, Linux의 경우 `libgtk-3-dev`, `libwebkit2gtk-4.1-dev` 등)

### 2. 초기 설정 및 WASM 코어 빌드
```bash
# 1. 저장소 클론
git clone https://github.com/dalli/rhwp.git
cd rhwp

# 2. wasm-pack 설치 (설치되어 있지 않은 경우)
cargo install wasm-pack

# 3. WASM 코어 모듈 빌드
wasm-pack build --target web --release
```

### 3. Tauri 데스크톱 앱 실행
```bash
# 1. 데스크톱 앱 디렉토리로 이동
cd rhwp-studio

# 2. 패키지 설치
npm install

# 3. 개발 서버 실행 (Tauri 데스크톱 앱 실행)
npm run tauri dev
```

### 4. 배포용 실행 파일 빌드
```bash
cd rhwp-studio
npm run tauri build
```
빌드가 완료되면 `src-tauri/target/release/bundle` 디렉토리 내에 각 OS별 설치 파일이 생성됩니다.

## 📚 기존 코어 아키텍처 및 상세 문서
이 리포지토리의 원본 코드 구조, 웹 파서 아키텍처 및 개발 로드맵에 대한 상세 정보는 [README_origin.md](./README_origin.md)에서 확인하실 수 있습니다.

## 📄 라이선스
MIT License
