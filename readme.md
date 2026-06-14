# Steam Game Recommendation Web App

## Phiên Bản Tiếng Việt

### 1. Giới Thiệu

Dự án này xây dựng pipeline dữ liệu Steam và web app để khám phá, lọc, xem chi tiết và gợi ý game tương tự.

Luồng chạy chuẩn:

```text
Crawl dữ liệu -> Clean dữ liệu -> EDA + feature hữu ích -> Chạy backend -> Chạy frontend
```

Path dữ liệu thống nhất:

```text
data/raw/SteamGames.csv
data/raw/SteamGames.json
data/processed/SteamGames_cleaned.csv
```

Web app luôn đọc file sạch từ:

```text
data/processed/SteamGames_cleaned.csv
```

Không dùng các path cũ như `data/SteamGames.csv`, `data/SteamGames_cleaned.csv` hoặc `steam-game-web/backend/data/SteamGames_cleaned.csv`.

### 2. Yêu Cầu Môi Trường

- Python 3.10+
- Node.js 18+
- npm

Tất cả lệnh bên dưới mặc định chạy từ thư mục gốc project, trừ khi có lệnh `cd` riêng.

### 3. Cài Python Environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirement.txt
```

Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirement.txt
```

### 4. Chạy Data Pipeline

#### Bước 4.1: Crawl Raw Data

```powershell
python notebooks/01_Data_collection/main.py
```

Output:

- [data/raw/SteamGames.csv](data/raw/SteamGames.csv)
- [data/raw/SteamGames.json](data/raw/SteamGames.json)

Ghi chú:

- Crawler sẽ tự tạo thư mục `data/raw` nếu chưa có.
- Nếu `data/raw/SteamGames.csv` đã tồn tại, crawler đọc các `Appid` đã có để tránh crawl trùng.
- Quá trình crawl có thể lâu vì phải gọi Steam API và scrape từng game.

Nếu chỉ cần cào bổ sung review bị thiếu hoặc bị `0`, chạy:

```powershell
python notebooks/01_Data_collection/backfill_reviews.py
```

Fallback review đã bật mặc định. Thêm `--backup` nếu muốn tạo backup trước khi ghi đè raw CSV:

```powershell
python notebooks/01_Data_collection/backfill_reviews.py --backup
```

Sau khi backfill review, chạy lại notebook cleaning và EDA để `data/processed/SteamGames_cleaned.csv` được cập nhật.

#### Bước 4.2: Clean Data

Mở notebook:

[notebooks/02-cleaning-data-and-imputation.ipynb](notebooks/02-cleaning-data-and-imputation.ipynb)

Chạy toàn bộ notebook từ trên xuống dưới.

Input:

- [data/raw/SteamGames.csv](data/raw/SteamGames.csv)

Output:

- [data/processed/SteamGames_cleaned.csv](data/processed/SteamGames_cleaned.csv)
- `data/processed/quality_reports/`

#### Bước 4.3: EDA Và Feature Hữu Ích

Mở notebook:

[notebooks/03-exploratory-data-analysis.ipynb](notebooks/03-exploratory-data-analysis.ipynb)

Chạy toàn bộ notebook từ trên xuống dưới.

Notebook EDA đọc:

- [data/raw/SteamGames.csv](data/raw/SteamGames.csv)
- [data/processed/SteamGames_cleaned.csv](data/processed/SteamGames_cleaned.csv)


### 5. Chạy Web App

Trước khi chạy web, cần đảm bảo file này tồn tại:

```text
data/processed/SteamGames_cleaned.csv
```

#### Terminal 1: Chạy Backend

Từ thư mục gốc project:

```powershell
.\.venv\Scripts\Activate.ps1
cd steam-game-web/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

- http://localhost:8000
- http://localhost:8000/docs

#### Terminal 2: Chạy Frontend

Mở terminal mới từ thư mục gốc project:

```powershell
cd steam-game-web/frontend
npm install
npm run dev
```

Frontend:

- http://localhost:3000

Frontend mặc định gọi backend tại `http://localhost:8000`.
Nếu backend chạy ở URL khác, tạo file `steam-game-web/frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

### 6. Quick Start

Từ thư mục gốc project:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirement.txt
```

Nếu repo đã có sẵn `data/raw/SteamGames.csv` và `data/processed/SteamGames_cleaned.csv`, có thể bỏ qua bước crawl/clean và chạy web ngay.

Nếu muốn chạy lại toàn bộ pipeline:

```powershell
python notebooks/01_Data_collection/main.py
```

Sau đó chạy lần lượt:

1. Notebook cleaning: [notebooks/02-cleaning-data-and-imputation.ipynb](notebooks/02-cleaning-data-and-imputation.ipynb)
2. Notebook EDA: [notebooks/03-exploratory-data-analysis.ipynb](notebooks/03-exploratory-data-analysis.ipynb)

Chạy backend ở Terminal 1:

```powershell
.\.venv\Scripts\Activate.ps1
cd steam-game-web/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Chạy frontend ở Terminal 2:

```powershell
cd steam-game-web/frontend
npm install
npm run dev
```

Mở web:

```text
http://localhost:3000
```

### 7. Test Nhanh Path

Kiểm tra path data:

```powershell
python -c "import sys; from pathlib import Path; sys.path.insert(0, str(Path('notebooks/01_Data_collection').resolve())); from path_utils import ensure_data_layout; p=ensure_data_layout(); print(p['raw_path'], p['raw_path'].exists()); print(p['cleaned_path'], p['cleaned_path'].exists())"
```

Chạy test backend path:

```powershell
python -m pytest steam-game-web/backend/tests/test_path_resolution.py -q
```

### 8. Cấu Trúc Thư Mục Chính

```text
.
├── readme.md
├── requirement.txt
├── data/
│   ├── raw/
│   │   ├── SteamGames.csv
│   │   └── SteamGames.json
│   └── processed/
│       ├── SteamGames_cleaned.csv
│       └── quality_reports/
├── notebooks/
│   ├── 01_Data_collection/
│   │   ├── path_utils.py
│   │   ├── main.py
│   │   ├── main.ipynb
│   │   ├── backfill_reviews.py
│   │   ├── Crawler.py
│   │   ├── ReviewParser.py
│   │   ├── Saving.py
│   │   └── ...
│   ├── 02-cleaning-data-and-imputation.ipynb
│   └── 03-exploratory-data-analysis.ipynb
└── steam-game-web/
    ├── backend/
    │   ├── app/
    │   │   ├── main.py
    │   │   ├── data_loader.py
    │   │   ├── recommender.py
    │   │   ├── schemas.py
    │   │   └── utils.py
    │   ├── tests/
    │   │   └── test_path_resolution.py
    │   └── requirements.txt
    └── frontend/
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   ├── styles/
        │   ├── api.js
        │   ├── App.jsx
        │   └── main.jsx
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        └── tailwind.config.js
```

Ghi chú:

- `data/raw/` là output của crawler.
- `data/processed/` là output của cleaning và EDA.
- `steam-game-web/backend/app/utils.py` resolve path về `data/processed/SteamGames_cleaned.csv` ở project root.
- `steam-game-web/frontend/node_modules/`, `steam-game-web/frontend/dist/`, `__pycache__/` là thư mục sinh ra khi chạy local, không phải phần cần chỉnh chính.

Path rút gọn cần nhớ:

```text
data/
  raw/
    SteamGames.csv
    SteamGames.json
  processed/
    SteamGames_cleaned.csv
    quality_reports/

notebooks/
  01_Data_collection/
    path_utils.py
    main.py
    main.ipynb
    backfill_reviews.py
  02-cleaning-data-and-imputation.ipynb
  03-exploratory-data-analysis.ipynb

steam-game-web/
  backend/
    app/
    tests/
    requirements.txt
  frontend/
    src/
    package.json
```

### 9. Troubleshooting

- `ModuleNotFoundError`: activate `.venv` và chạy `python -m pip install -r requirement.txt`.
- Notebook không có kernel: chạy `python -m pip install jupyter ipykernel`.
- Cleaning/EDA không thấy file: kiểm tra đã có `data/raw/SteamGames.csv`.
- Backend không thấy CSV: kiểm tra `data/processed/SteamGames_cleaned.csv`.
- Frontend không load data: đảm bảo backend đang chạy tại `http://localhost:8000`.
- Đổi backend URL: sửa `VITE_API_BASE_URL` trong `steam-game-web/frontend/.env`.

---

## English Version

### 1. Overview

This project builds a Steam data pipeline and a web app for exploring, filtering, viewing details, and finding similar games.

Standard workflow:

```text
Crawl data -> Clean data -> EDA + useful features -> Run backend -> Run frontend
```

Standard data paths:

```text
data/raw/SteamGames.csv
data/raw/SteamGames.json
data/processed/SteamGames_cleaned.csv
```

The web app always reads the cleaned dataset from:

```text
data/processed/SteamGames_cleaned.csv
```

Do not use old paths such as `data/SteamGames.csv`, `data/SteamGames_cleaned.csv`, or `steam-game-web/backend/data/SteamGames_cleaned.csv`.

### 2. Requirements

- Python 3.10+
- Node.js 18+
- npm

All commands below assume you are running them from the project root unless a `cd` command is shown.

### 3. Set Up Python Environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirement.txt
```

Linux/macOS:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirement.txt
```

### 4. Run The Data Pipeline

#### Step 4.1: Crawl Raw Data

```powershell
python notebooks/01_Data_collection/main.py
```

Output:

- [data/raw/SteamGames.csv](data/raw/SteamGames.csv)
- [data/raw/SteamGames.json](data/raw/SteamGames.json)

Notes:

- The crawler creates `data/raw` automatically if needed.
- If `data/raw/SteamGames.csv` already exists, the crawler reads existing `Appid` values to avoid duplicate crawling.
- Crawling may take a long time because it calls the Steam API and scrapes each game page.

To backfill only missing or zero review values, run:

```powershell
python notebooks/01_Data_collection/backfill_reviews.py
```

Review fallback is enabled by default. Add `--backup` if you want to create a backup before overwriting the raw CSV:

```powershell
python notebooks/01_Data_collection/backfill_reviews.py --backup
```

After backfilling reviews, rerun the cleaning and EDA notebooks so `data/processed/SteamGames_cleaned.csv` is updated.

#### Step 4.2: Clean Data

Open this notebook:

[notebooks/02-cleaning-data-and-imputation.ipynb](notebooks/02-cleaning-data-and-imputation.ipynb)

Run all cells from top to bottom.

Input:

- [data/raw/SteamGames.csv](data/raw/SteamGames.csv)

Output:

- [data/processed/SteamGames_cleaned.csv](data/processed/SteamGames_cleaned.csv)
- `data/processed/quality_reports/`

#### Step 4.3: EDA And Useful Features

Open this notebook:

[notebooks/03-exploratory-data-analysis.ipynb](notebooks/03-exploratory-data-analysis.ipynb)

Run all cells from top to bottom.

The EDA notebook reads:

- [data/raw/SteamGames.csv](data/raw/SteamGames.csv)
- [data/processed/SteamGames_cleaned.csv](data/processed/SteamGames_cleaned.csv)

The EDA notebook also saves selected useful features back to `data/processed/SteamGames_cleaned.csv`, such as:

- `price_numeric`
- `price_type`
- `TotalReviews`
- `ReviewRatio`
- `ReviewConfidence`
- `BayesianRating`
- `PopularityScore`
- `FreshnessScore`
- `AffordabilityScore`
- `PriceBucket`
- `DiscoveryScore`

Therefore, the recommended order is: crawl first, clean second, then run EDA.
Feature engineering is handled inside the EDA notebook, so no separate feature-engineering file is required.

### 5. Run The Web App

Before running the web app, make sure this file exists:

```text
data/processed/SteamGames_cleaned.csv
```

#### Terminal 1: Run Backend

From the project root:

```powershell
.\.venv\Scripts\Activate.ps1
cd steam-game-web/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

- http://localhost:8000
- http://localhost:8000/docs

#### Terminal 2: Run Frontend

Open a new terminal from the project root:

```powershell
cd steam-game-web/frontend
npm install
npm run dev
```

Frontend:

- http://localhost:3000

The frontend calls `http://localhost:8000` by default.
If your backend uses a different URL, create `steam-game-web/frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

### 6. Quick Start For A Fresh Clone

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirement.txt
```

If the repository already includes `data/raw/SteamGames.csv` and `data/processed/SteamGames_cleaned.csv`, you can skip crawling/cleaning and run the web app directly.

To rerun the full pipeline:

```powershell
python notebooks/01_Data_collection/main.py
```

Then run these notebooks in order:

1. Cleaning notebook: [notebooks/02-cleaning-data-and-imputation.ipynb](notebooks/02-cleaning-data-and-imputation.ipynb)
2. EDA notebook: [notebooks/03-exploratory-data-analysis.ipynb](notebooks/03-exploratory-data-analysis.ipynb)

Run backend in Terminal 1:

```powershell
.\.venv\Scripts\Activate.ps1
cd steam-game-web/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run frontend in Terminal 2:

```powershell
cd steam-game-web/frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

### 7. Quick Path Tests

Check data paths:

```powershell
python -c "import sys; from pathlib import Path; sys.path.insert(0, str(Path('notebooks/01_Data_collection').resolve())); from path_utils import ensure_data_layout; p=ensure_data_layout(); print(p['raw_path'], p['raw_path'].exists()); print(p['cleaned_path'], p['cleaned_path'].exists())"
```

Run backend path test:

```powershell
python -m pytest steam-game-web/backend/tests/test_path_resolution.py -q
```

### 8. Main Directory Structure

```text
.
├── readme.md
├── requirement.txt
├── data/
│   ├── raw/
│   │   ├── SteamGames.csv
│   │   └── SteamGames.json
│   └── processed/
│       ├── SteamGames_cleaned.csv
│       └── quality_reports/
├── notebooks/
│   ├── 01_Data_collection/
│   │   ├── path_utils.py
│   │   ├── main.py
│   │   ├── main.ipynb
│   │   ├── backfill_reviews.py
│   │   ├── Crawler.py
│   │   ├── ReviewParser.py
│   │   ├── Saving.py
│   │   └── ...
│   ├── 02-cleaning-data-and-imputation.ipynb
│   └── 03-exploratory-data-analysis.ipynb
└── steam-game-web/
    ├── backend/
    │   ├── app/
    │   │   ├── main.py
    │   │   ├── data_loader.py
    │   │   ├── recommender.py
    │   │   ├── schemas.py
    │   │   └── utils.py
    │   ├── tests/
    │   │   └── test_path_resolution.py
    │   └── requirements.txt
    └── frontend/
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   ├── styles/
        │   ├── api.js
        │   ├── App.jsx
        │   └── main.jsx
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        └── tailwind.config.js
```

Notes:

- `data/raw/` is generated by the crawler.
- `data/processed/` is generated by cleaning and EDA.
- `steam-game-web/backend/app/utils.py` resolves the backend data path to `data/processed/SteamGames_cleaned.csv` at the project root.
- `steam-game-web/frontend/node_modules/`, `steam-game-web/frontend/dist/`, and `__pycache__/` are local generated folders, not the main files to edit.

Short path summary:

```text
data/
  raw/
    SteamGames.csv
    SteamGames.json
  processed/
    SteamGames_cleaned.csv
    quality_reports/

notebooks/
  01_Data_collection/
    path_utils.py
    main.py
    main.ipynb
    backfill_reviews.py
  02-cleaning-data-and-imputation.ipynb
  03-exploratory-data-analysis.ipynb

steam-game-web/
  backend/
    app/
    tests/
    requirements.txt
  frontend/
    src/
    package.json
```

### 9. Troubleshooting

- `ModuleNotFoundError`: activate `.venv` and run `python -m pip install -r requirement.txt`.
- Missing notebook kernel: run `python -m pip install jupyter ipykernel`.
- Cleaning/EDA cannot find files: check that `data/raw/SteamGames.csv` exists.
- Backend cannot find CSV: check `data/processed/SteamGames_cleaned.csv`.
- Frontend cannot load data: make sure the backend is running at `http://localhost:8000`.
- Different backend URL: update `VITE_API_BASE_URL` in `steam-game-web/frontend/.env`.
