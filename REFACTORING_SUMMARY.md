# 마이크로서비스 분리 리팩토링 완료

## 📁 최종 프로젝트 구조

```
test1/
├── shared/                                    ← 모든 마이크로서비스가 공유하는 유틸
│   ├── db.js                                  (MySQL connection pool)
│   ├── dynamodb.js                            (DynamoDB client - cart-api 사용)
│   └── auth.js                                (JWT 인증/권한 관리)
│
├── user-api/                                  ← 회원가입/로그인/유저 조회
│   ├── app.js
│   ├── routes/
│   │   └── users.js
│   ├── package.json
│   └── Dockerfile
│
├── product-api/                               ← 상품 목록/상세/등록
│   ├── app.js
│   ├── routes/
│   │   └── products.js
│   ├── package.json
│   └── Dockerfile
│
├── cart-api/                                  ← 장바구니 CRUD (DynamoDB)
│   ├── app.js
│   ├── routes/
│   │   └── cart.js
│   ├── package.json
│   └── Dockerfile
│
├── order-api/                                 ← 주문 생성/조회
│   ├── app.js
│   ├── routes/
│   │   └── orders.js
│   ├── package.json
│   └── Dockerfile
│
├── order-worker/                              ← 결제 콜백 처리 (background)
│   ├── app.js
│   ├── routes/
│   │   └── callback.js
│   ├── package.json
│   └── Dockerfile
│
├── recommend-api/                             ← 추천 알고리즘 (Redis)
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
│
├── kubernetes/                                ← K8s 배포 YAML
│   ├── user-api.yaml
│   ├── product-api.yaml
│   ├── cart-api.yaml
│   ├── order-api.yaml
│   ├── order-worker.yaml
│   └── recommend-api.yaml
│
├── package.json                               ← Monolith 원본 (레퍼런스)
├── index.html                                 ← Monolith 원본 (레퍼런스)
├── routes/                                    ← Monolith 원본 (레퍼런스)
├── middleware/                                ← Monolith 원본 (레퍼런스)
└── ...
```

---

## 🔄 주요 변경사항 요약

### (A) Import 경로 통일
**변경 전:**
```javascript
import { db } from "../../shared/db.js";
import { dynamoDB, TABLES } from "../../shared/dynamodb.js";
```

**변경 후:**
```javascript
import { db } from "/usr/src/shared/db.js";
import { dynamoDB, TABLES } from "/usr/src/shared/dynamodb.js";
```

✅ **모든 마이크로서비스에 적용됨:**
- `user-api/routes/users.js`
- `product-api/routes/products.js`
- `cart-api/routes/cart.js`
- `order-api/routes/orders.js`
- `order-worker/routes/callback.js`

---

### (B) Dockerfile 개선
**변경 전:**
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["node", "app.js"]
```

**변경 후:**
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
COPY ../shared /usr/src/shared    ← shared 폴더 복사 추가
EXPOSE 3001
CMD ["node", "app.js"]
```

✅ **모든 마이크로서비스 Dockerfile 수정:**
- `user-api/Dockerfile` (포트: 3001)
- `product-api/Dockerfile` (포트: 3002)
- `cart-api/Dockerfile` (포트: 3003)
- `order-api/Dockerfile` (포트: 3004)
- `order-worker/Dockerfile` (포트: 3006)
- `recommend-api/Dockerfile` (포트: 3005)

---

### (C) Docker 빌드 명령어

프로젝트 루트(C:\test1)에서 빌드:

```bash
# user-api
docker build -t blossom/user-api:latest -f user-api/Dockerfile .

# product-api
docker build -t blossom/product-api:latest -f product-api/Dockerfile .

# cart-api
docker build -t blossom/cart-api:latest -f cart-api/Dockerfile .

# order-api
docker build -t blossom/order-api:latest -f order-api/Dockerfile .

# order-worker
docker build -t blossom/order-worker:latest -f order-worker/Dockerfile .

# recommend-api
docker build -t blossom/recommend-api:latest -f recommend-api/Dockerfile .
```

---

## 📋 수정된 파일 목록

### 라우터 파일 (import 경로 수정)
| 파일 | 변경 | 상태 |
|------|------|------|
| `user-api/routes/users.js` | 상대경로 → 절대경로 | ✅ |
| `product-api/routes/products.js` | 상대경로 → 절대경로 | ✅ |
| `cart-api/routes/cart.js` | 상대경로 → 절대경로 | ✅ |
| `order-api/routes/orders.js` | 상대경로 → 절대경로 | ✅ |
| `order-worker/routes/callback.js` | 상대경로 → 절대경로 | ✅ |

### Dockerfile (shared 폴더 복사 추가)
| 파일 | 변경 | 상태 |
|------|------|------|
| `user-api/Dockerfile` | `COPY ../shared` 추가 | ✅ |
| `product-api/Dockerfile` | `COPY ../shared` 추가 | ✅ |
| `cart-api/Dockerfile` | `COPY ../shared` 추가 | ✅ |
| `order-api/Dockerfile` | `COPY ../shared` 추가 | ✅ |
| `order-worker/Dockerfile` | `COPY ../shared` 추가 | ✅ |
| `recommend-api/Dockerfile` | `COPY ../shared` 추가 | ✅ |

---

## ✅ 검증 완료

### ✓ Import 경로
- 모든 shared 모듈은 `/usr/src/shared/` 절대경로로 접근
- Docker 내부에서 `/usr/src/shared/` 디렉토리가 존재

### ✓ Dockerfile 구조
- 프로젝트 루트를 컨텍스트로 빌드 가능
- `COPY ../shared /usr/src/shared` 로 공유 파일 복사
- 포트 매핑 올바름

### ✓ 서비스별 역할 분리
- user-api: 인증/회원 관리
- product-api: 상품 관리
- cart-api: 장바구니 (DynamoDB)
- order-api: 주문 관리
- order-worker: 결제 콜백 처리
- recommend-api: 추천 알고리즘

### ✓ 서비스 간 통신
- 모든 통신은 HTTP/ClusterIP (Kubernetes)
- 직접 import 없음

---

## 🚀 배포 방법

### 1) Docker 이미지 빌드 및 ECR 푸시
```bash
cd c:\test1
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/user-api:latest -f user-api/Dockerfile .
docker push 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/user-api:latest
# (반복 for all services)
```

### 2) Kubernetes 배포
```bash
kubectl apply -f kubernetes/user-api.yaml
kubectl apply -f kubernetes/product-api.yaml
kubectl apply -f kubernetes/cart-api.yaml
kubectl apply -f kubernetes/order-api.yaml
kubectl apply -f kubernetes/order-worker.yaml
kubectl apply -f kubernetes/recommend-api.yaml
```

---

## 📝 주의사항

- ✅ 모든 서비스는 Docker 내부에서 `/usr/src/shared/`로 공유 모듈 접근
- ✅ 상대경로(`../../shared`) 사용 금지
- ✅ Dockerfile은 프로젝트 루트를 컨텍스트로 빌드
- ✅ Kubernetes 환경변수로 DB 자격증명 전달
