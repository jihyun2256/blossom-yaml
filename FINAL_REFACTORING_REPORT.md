# 마이크로서비스 완전 리팩토링 완료 보고서

## 📊 최종 프로젝트 구조 트리

```
C:\test1\
│
├── 📁 shared/                                          ← 공유 유틸 폴더
│   ├── 📄 db.js                                        (MySQL connection pool)
│   ├── 📄 dynamodb.js                                  (DynamoDB client)
│   └── 📄 auth.js                                      (JWT auth utilities)
│
├── 📁 user-api/                                        ← 마이크로서비스 1
│   ├── 📄 app.js                                       (Express 서버, 포트: 3001)
│   ├── 📁 routes/
│   │   └── 📄 users.js                                 (회원가입/로그인/조회)
│   ├── 📄 package.json
│   └── 📄 Dockerfile                                   (COPY ../shared 추가됨)
│
├── 📁 product-api/                                     ← 마이크로서비스 2
│   ├── 📄 app.js                                       (Express 서버, 포트: 3002)
│   ├── 📁 routes/
│   │   └── 📄 products.js                              (상품 CRUD, S3 이미지)
│   ├── 📄 package.json
│   └── 📄 Dockerfile                                   (COPY ../shared 추가됨)
│
├── 📁 cart-api/                                        ← 마이크로서비스 3
│   ├── 📄 app.js                                       (Express 서버, 포트: 3003)
│   ├── 📁 routes/
│   │   └── 📄 cart.js                                  (장바구니 CRUD, DynamoDB)
│   ├── 📄 package.json
│   └── 📄 Dockerfile                                   (COPY ../shared 추가됨)
│
├── 📁 order-api/                                       ← 마이크로서비스 4
│   ├── 📄 app.js                                       (Express 서버, 포트: 3004)
│   ├── 📁 routes/
│   │   └── 📄 orders.js                                (주문 생성/조회)
│   ├── 📄 package.json
│   └── 📄 Dockerfile                                   (COPY ../shared 추가됨)
│
├── 📁 order-worker/                                    ← 마이크로서비스 5
│   ├── 📄 app.js                                       (Express 서버, 포트: 3006)
│   ├── 📁 routes/
│   │   └── 📄 callback.js                              (결제 콜백 처리)
│   ├── 📄 package.json
│   └── 📄 Dockerfile                                   (COPY ../shared 추가됨)
│
├── 📁 recommend-api/                                   ← 마이크로서비스 6
│   ├── 📄 app.js                                       (Express 서버, 포트: 3005)
│   ├── 📄 package.json
│   └── 📄 Dockerfile                                   (COPY ../shared 추가됨)
│
├── 📁 kubernetes/                                      ← Kubernetes 배포 YAML
│   ├── 📄 user-api.yaml
│   ├── 📄 product-api.yaml
│   ├── 📄 cart-api.yaml
│   ├── 📄 order-api.yaml
│   ├── 📄 order-worker.yaml
│   └── 📄 recommend-api.yaml
│
├── 📁 middleware/                                      ← Monolith 원본 (레퍼런스)
├── 📁 routes/                                          ← Monolith 원본 (레퍼런스)
├── 📄 package.json                                     ← Monolith 원본
├── 📄 index.html
├── 📄 REFACTORING_SUMMARY.md                           ← 이 리팩토링 문서
└── 📄 ...

```

---

## 🔧 핵심 변경사항 요약

### 1️⃣ Import 경로 변경 (상대 → 절대)

**변경 전 (상대경로):**
```javascript
import { db } from "../../shared/db.js";
import { dynamoDB, TABLES } from "../../shared/dynamodb.js";
```

**변경 후 (절대경로 - Docker 내부):**
```javascript
import { db } from "/usr/src/shared/db.js";
import { dynamoDB, TABLES } from "/usr/src/shared/dynamodb.js";
```

**수정 파일:**
- ✅ `user-api/routes/users.js`
- ✅ `product-api/routes/products.js`
- ✅ `cart-api/routes/cart.js`
- ✅ `order-api/routes/orders.js`
- ✅ `order-worker/routes/callback.js`

---

### 2️⃣ Dockerfile 구조 개선

**모든 서비스 Dockerfile에 다음 라인 추가:**
```dockerfile
COPY ../shared /usr/src/shared
```

**수정 Dockerfile:**
- ✅ `user-api/Dockerfile` (PORT 3001)
- ✅ `product-api/Dockerfile` (PORT 3002)
- ✅ `cart-api/Dockerfile` (PORT 3003)
- ✅ `order-api/Dockerfile` (PORT 3004)
- ✅ `order-worker/Dockerfile` (PORT 3006)
- ✅ `recommend-api/Dockerfile` (PORT 3005)

---

### 3️⃣ app.js 포트 수정

| 서비스 | 파일 | 변경 전 | 변경 후 |
|--------|------|--------|--------|
| cart-api | `app.js` | 3004 | 3003 ✅ |
| order-worker | `app.js` | 3010 | 3006 ✅ |

---

## 📝 수정된 파일 상세 목록

### A) Import 경로 수정 파일

#### `user-api/routes/users.js`
```diff
- import { db } from "../../shared/db.js";
+ import { db } from "/usr/src/shared/db.js";
```

#### `product-api/routes/products.js`
```diff
- import { db } from "../../shared/db.js";
+ import { db } from "/usr/src/shared/db.js";
```

#### `cart-api/routes/cart.js`
```diff
- import { dynamoDB, TABLES } from "../../shared/dynamodb.js";
+ import { dynamoDB, TABLES } from "/usr/src/shared/dynamodb.js";
```

#### `order-api/routes/orders.js`
```diff
- import { db } from "../../shared/db.js";
+ import { db } from "/usr/src/shared/db.js";
```

#### `order-worker/routes/callback.js`
```diff
- import { dynamoDB, TABLES } from "../../shared/dynamodb.js";
+ import { dynamoDB, TABLES } from "/usr/src/shared/dynamodb.js";
```

---

### B) Dockerfile 수정

#### `user-api/Dockerfile`
```diff
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package.json ./
- RUN npm install --production
+ RUN npm install --omit=dev
  COPY . .
+ COPY ../shared /usr/src/shared
  EXPOSE 3001
  CMD ["node", "app.js"]
```

#### `product-api/Dockerfile`
```diff
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package.json ./
- RUN npm install --production
+ RUN npm install --omit=dev
  COPY . .
+ COPY ../shared /usr/src/shared
  EXPOSE 3002
  CMD ["node", "app.js"]
```

#### `cart-api/Dockerfile`
```diff
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package.json ./
- RUN npm install --production
+ RUN npm install --omit=dev
  COPY . .
+ COPY ../shared /usr/src/shared
- EXPOSE 3004
+ EXPOSE 3003
  CMD ["node", "app.js"]
```

#### `order-api/Dockerfile`
```diff
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package.json ./
- RUN npm install --production
+ RUN npm install --omit=dev
  COPY . .
+ COPY ../shared /usr/src/shared
- EXPOSE 3003
+ EXPOSE 3004
  CMD ["node", "app.js"]
```

#### `order-worker/Dockerfile`
```diff
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package.json ./
- RUN npm install --production
+ RUN npm install --omit=dev
  COPY . .
+ COPY ../shared /usr/src/shared
- EXPOSE 3010
+ EXPOSE 3006
  CMD ["node", "app.js"]
```

#### `recommend-api/Dockerfile`
```diff
  FROM node:18-alpine
  WORKDIR /usr/src/app
  COPY package.json ./
- RUN npm install --production
+ RUN npm install --omit=dev
  COPY . .
+ COPY ../shared /usr/src/shared
  EXPOSE 3005
  CMD ["node", "app.js"]
```

---

### C) app.js 포트 수정

#### `cart-api/app.js`
```diff
- const PORT = process.env.PORT || 3004;
+ const PORT = process.env.PORT || 3003;
  app.listen(PORT, () => console.log(`cart-api listening on ${PORT}`));
```

#### `order-worker/app.js`
```diff
- const PORT = process.env.PORT || 3010;
+ const PORT = process.env.PORT || 3006;
  app.listen(PORT, () => console.log(`order-worker listening on ${PORT}`));
```

---

## 🐳 Docker 빌드 명령어

**프로젝트 루트(C:\test1)에서 실행:**

```bash
# user-api 빌드
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/user-api:latest -f user-api/Dockerfile .

# product-api 빌드
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/product-api:latest -f product-api/Dockerfile .

# cart-api 빌드
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/cart-api:latest -f cart-api/Dockerfile .

# order-api 빌드
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/order-api:latest -f order-api/Dockerfile .

# order-worker 빌드
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/order-worker:latest -f order-worker/Dockerfile .

# recommend-api 빌드
docker build -t 337112169365.dkr.ecr.ap-northeast-2.amazonaws.com/blossom/recommend-api:latest -f recommend-api/Dockerfile .
```

---

## ☸️ Kubernetes 배포

```bash
# 모든 서비스 한번에 배포
kubectl apply -f kubernetes/

# 또는 개별 배포
kubectl apply -f kubernetes/user-api.yaml
kubectl apply -f kubernetes/product-api.yaml
kubectl apply -f kubernetes/cart-api.yaml
kubectl apply -f kubernetes/order-api.yaml
kubectl apply -f kubernetes/order-worker.yaml
kubectl apply -f kubernetes/recommend-api.yaml
```

---

## ✅ 검증 체크리스트

### Import 경로
- [x] 모든 shared import가 `/usr/src/shared/` 절대경로 사용
- [x] 상대경로(`../../shared`) 제거됨
- [x] Docker 내부에서 `/usr/src/shared/` 경로 존재

### Dockerfile
- [x] 모든 Dockerfile에 `COPY ../shared /usr/src/shared` 추가
- [x] 프로젝트 루트를 컨텍스트로 빌드 가능
- [x] npm install을 `--omit=dev`로 최적화

### 포트 설정
- [x] user-api → 3001
- [x] product-api → 3002
- [x] cart-api → 3003
- [x] order-api → 3004
- [x] recommend-api → 3005
- [x] order-worker → 3006

### 서비스 분리
- [x] user-api: 인증/회원 관리
- [x] product-api: 상품 관리 (S3)
- [x] cart-api: 장바구니 (DynamoDB)
- [x] order-api: 주문 관리
- [x] order-worker: 결제 콜백 처리
- [x] recommend-api: 추천 알고리즘

### 공유 모듈
- [x] shared/db.js (MySQL connection pool)
- [x] shared/dynamodb.js (DynamoDB client)
- [x] shared/auth.js (JWT utilities)

---

## 🚀 배포 후 검증

```bash
# Pod 상태 확인
kubectl get pods

# 서비스 상태 확인
kubectl get svc

# 특정 Pod 로그 확인
kubectl logs pod/user-api-xxxxx

# Port Forward로 로컬 테스트
kubectl port-forward svc/user-api 3001:3001
curl http://localhost:3001/health
```

---

## 📌 주요 주의사항

1. **Docker 빌드 시:** 프로젝트 루트(C:\test1)에서 빌드해야 `../shared` 경로가 올바름
2. **Import 경로:** 절대경로 `/usr/src/shared/` 사용 필수 (상대경로 금지)
3. **Kubernetes 환경변수:** 각 서비스에 DB 자격증명 환경변수 전달
4. **포트 중복:** 각 서비스 포트 설정이 일치해야 함 (app.js, Dockerfile, K8s YAML)

