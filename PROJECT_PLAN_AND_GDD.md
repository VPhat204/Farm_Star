# 🌍 GAME DESIGN DOCUMENT & KẾ HOẠCH TRIỂN KHAI: STARFARM — HÀNH TRÌNH NGÂN HÀ

---

## 🌟 1. TỔNG QUAN & TẦM NHÌN (VISION & OVERVIEW)
- **Tên dự án:** **STARFARM: Hành Trình Ngân Hà**
- **Thể loại:** Space Farming + Shoot 'em Up (Bullet Hell) + RPG Progression + Gacha / Collection.
- **Nền tảng:** Web (PC & Mobile Browser), PWA / Mobile Responsive.
- **Core Loop:**
  $$\text{🌱 Trồng trọt / Sản xuất} \longrightarrow \text{💰 Bán tài nguyên (Credits/Fuel)} \longrightarrow \text{✈️ Nâng cấp Chiến cơ & Trang bị} \longrightarrow \text{🎰 Gacha} \longrightarrow \text{⚔️ Xuất kích Đi ải (Shoot'em Up)} \longrightarrow \text{🎁 Thu chiến lợi phẩm (Quặng, Blueprint)} \longrightarrow \text{🔬 Mở rộng & Phát triển Hành tinh}$$

---

## 🪐 2. HỆ THỐNG HÀNH TINH & NÔNG NGHIỆP KHÔNG GIAN (PLANET & FARMING)

### 2.1. Cấu Trúc Các Khu Vực Trên Hành Tinh (Gaia-01)
| Khu Vực | Biểu Tượng | Chức Năng Chính |
| :--- | :---: | :--- |
| **Ô Đất Trồng (Farm Plots)** | 🌱 | Trồng cây nông nghiệp vũ trụ, thu hoạch theo thời gian thực. |
| **Nhà Máy (Factory)** | 🏭 | Chế biến nông sản thành Thức ăn năng lượng (Energy Food), Nhiên liệu (Fuel). |
| **Mỏ Khai Thác (Mine)** | ⛏️ | Khai thác thụ động Quặng Sắt (Iron), Titanium, Pha Lê (Crystal). |
| **Trạm Năng Lượng (Energy Station)** | 🔋 | Cung cấp Thể Lực (Energy ⚡) để xuất kích chiến đấu. |
| **Nhà Chứa Tàu (Hangar)** | 🛸 | Quản lý, trang bị và nâng cấp Hạm đội Chiến cơ. |
| **Phòng Nghiên Cứu (Research Lab)** | 🔬 | Nâng cấp công nghệ trồng trọt, khai khoáng và vũ khí. |
| **Kho Lưu Trữ (Storage)** | 📦 | Giới hạn sức chứa tài nguyên offline và nông sản. |
| **Chợ Liên Hành Tinh (Market)** | 🏪 | Bán nông sản / sản phẩm chế biến lấy **Credits 💰**. |

### 2.2. Danh Mục Nông Sản & Thời Gian Sinh Trưởng (MVP)
- **Lúa Mì Sao (Wheat):** Thời gian 1 phút $\to$ Thu hoạch 10 Credits.
- **Bắp Năng Lượng (Energy Corn):** Thời gian 3 phút $\to$ Chế tạo Nhiên liệu xuất kích (Fuel).
- **Cà Chua Nano (Nano Tomato):** Thời gian 5 phút $\to$ Chế tạo Bình Máu HP Potion khi chiến đấu.
- **Dâu Pha Lê (Crystal Berry):** Thời gian 15 phút $\to$ Chế biến nguyên liệu nâng cấp Core & Tinh luyện Gacha.

---

## ✈️ 3. HỆ THỐNG CHIẾN CƠ & TRANG BỊ (SHIPS & BUILDS)

### 3.1. Các Hệ Chiến Cơ (Classes)
1. **Fighter (⚡):** Tốc độ cao, DPS hỏa lực tập trung (*Scout-01, Falcon-X, Solar Wing*).
2. **Tank (🛡️):** HP & Khiên dày, phản đòn chí mạng (*Guardian-01, Star Guardian*).
3. **Bomber (💥):** Sát thương diện rộng, dọn wave quái nhanh (*Bomber-01, Galaxy Bomber*).
4. **Sniper (🎯):** Bắn xuyên giáp, chuyên khắc chế Boss (*Hunter-01, Nova Hunter*).
5. **Support / Drone Carrier (🤖):** Triệu hồi vệ tinh hỗ trợ, hồi máu/khiên (*Quantum Ark*).

### 3.2. Hệ Thống 6 Slot Thiết Bị (Equipment Build)
- **Primary Weapon:** Plasma Cannon, Laser Chùm, Tên Lửa Bám, Railgun.
- **Engine:** Ion Engine, Quantum Engine, Warp Engine (Tốc độ & Né đòn).
- **Armor & Shield:** Energy Shield, Plasma Shield, Gravity Shield.
- **Core:** Attack Core, Critical Core, Boss Core, Drone Core.
- **Module:** Giảm hồi chiêu nộ, Tăng tỷ lệ rớt đồ, Đạn nảy.

---

## 🎰 4. HỆ THỐNG GACHA & BẢO HIỂM (PITY SYSTEM)
- **Rarity:** N (45%) $\to$ R (30%) $\to$ SR (18%) $\to$ SSR (6.5%) $\to$ UR (0.5%).
- **Bảo hiểm (Pity):**
  - Mỗi 10 lượt quay $\to$ Chắc chắn nhận $\ge$ SR.
  - Mỗi 50 lượt quay $\to$ Chắc chắn nhận $\ge$ SSR.
- **Cơ chế Blueprint:** Nhận bản vẽ từ ải hoặc khi quay trùng $\to$ Đủ 50 mảnh có thể ghép Chiến cơ SSR trực tiếp.

---

## ⚔️ 5. COMBAT SHOOT'EM UP & PHẦN THƯỞNG (BATTLE & LOOT)
- Màn chơi dọc (Vertical Shoot 'em Up) trên Canvas mượt mà 60 FPS.
- Né đạn Bullet Hell, tiêu diệt Wave quái và Mini-Boss/Boss cuối màn.
- **Loot rơi trong trận:** Credits, EXP Khối, Quặng Sắt (Iron), Titanium, Mảnh Blueprint, Hộp trang bị ngẫu nhiên.

---

## 🏗️ 6. KIẾN TRÚC KỸ THUẬT (TECH ARCHITECTURE)

```text
StarFarm/
├── packages/
│   ├── client/                  # React + Vite + Phaser 3 + TailwindCSS
│   │   ├── src/
│   │   │   ├── components/      # UI: PlanetView, FarmModal, FactoryModal, Hangar, Gacha
│   │   │   ├── game/            # Phaser 3: BattleScene, Spaceship, Bullet, Enemy, Boss
│   │   │   ├── stores/          # Zustand Game State (Planet, Inventory, Ships)
│   │   │   └── services/        # API Client
│   │
│   ├── server/                  # Node.js + Express + Prisma ORM + MySQL
│   │   ├── prisma/              # schema.prisma & migrations
│   │   ├── src/
│   │   │   ├── controllers/     # Farm, Planet, Ships, Battle, Gacha, Market
│   │   │   ├── services/        # Game Economy Logic & Loot Verification
│   │   │   └── routes/
│   │
│   └── shared/                  # Types, Constants & Configs dùng chung 
│       ├── types/               # PlanetTypes, CropTypes, ShipTypes, ItemTypes
│       └── constants/           # GameConfig, CropConfigs, ShipStats, DropRates
├── PROJECT_PLAN_AND_GDD.md
├── package.json
└── README.md
```

---

## 📅 7. KẾ HOẠCH TRIỂN KHAI TỪNG BƯỚC (MVP ROADMAP)

- **Bước 1 (Monorepo & Data Models):** Tạo khung dự án, khởi tạo `packages/shared`, `packages/server`, `packages/client`. Thiết kế schema CSDL (Prisma + MySQL) lưu trữ thông tin Người chơi, Hành tinh, Ô đất trồng, Chiến cơ, Túi đồ.
- **Bước 2 (Nông Trại & Kinh Tế - Farm Core):** Xây dựng hệ thống Trồng trọt (Plant $\to$ Grow $\to$ Harvest), Nhà máy chế biến và Chợ bán nông sản lấy Credits/Năng lượng.
- **Bước 3 (Hangar & Nâng Cấp Tàu):** Xây dựng giao diện Hangar, xem chỉ số chiến cơ, trang bị 6 món đồ, nâng cấp level bằng Credits + Quặng thu thập.
- **Bước 4 (Game Chiến Đấu - Shoot'em Up Core):** Tích hợp Phaser 3: Điều khiển tàu, bắn đạn, quái xuất hiện theo wave, Boss màn 1, nhặt loot rơi (Iron, Credits, Blueprint).
- **Bước 5 (Gacha & Vòng Lặp Hoàn Chỉnh):** Xây dựng hệ thống Quay rương chiến cơ (Pity system), kết nối trọn vẹn vòng lặp: *Trồng cây $\to$ Bán tiền $\to$ Nâng tàu $\to$ Đi ải $\to$ Loot quặng $\to$ Về phát triển hành tinh*.
