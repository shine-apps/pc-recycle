import bcrypt from "bcryptjs";
import * as schema from "./schema";

export async function seedData(db: any) {
  // ===== 管理员 =====
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";
  const hash = await bcrypt.hash(password, 10);
  await db.insert(schema.admin).values({ username, passwordHash: hash });

  // ===== 分类 =====
  await db.insert(schema.categories).values([
    { name: "整机", slug: "desktop", sort: 1 },
    { name: "笔记本", slug: "laptop", sort: 2 },
    { name: "CPU", slug: "cpu", sort: 3 },
    { name: "显卡", slug: "gpu", sort: 4 },
    { name: "内存", slug: "ram", sort: 5 },
    { name: "硬盘", slug: "storage", sort: 6 },
    { name: "显示器", slug: "monitor", sort: 7 },
    { name: "外设", slug: "peripheral", sort: 8 },
  ]);

  // ===== 品牌 =====
  await db.insert(schema.brands).values([
    { name: "联想", sort: 1 },
    { name: "戴尔", sort: 2 },
    { name: "惠普", sort: 3 },
    { name: "华硕", sort: 4 },
    { name: "苹果", sort: 5 },
    { name: "小米", sort: 6 },
    { name: "Intel", sort: 7 },
    { name: "AMD", sort: 8 },
    { name: "NVIDIA", sort: 9 },
    { name: "金士顿", sort: 10 },
    { name: "三星", sort: 11 },
    { name: "西数", sort: 12 },
    { name: "希捷", sort: 13 },
    { name: "AOC", sort: 14 },
    { name: "罗技", sort: 15 },
    { name: "樱桃", sort: 16 },
    { name: "微星", sort: 17 },
    { name: "七彩虹", sort: 18 },
  ]);

  // ===== 商品 =====
  await db.insert(schema.products).values([
    // --- 整机 (categoryId: 1) ---
    {
      categoryId: 1, brandId: 1,
      title: "联想 ThinkCentre M720Q 迷你主机",
      condition: "95新", price: 1800,
      config: { cpu: "i5-8400T", ram: "8G DDR4", disk: "256G NVMe" },
      status: "onsale",
      description: "巴掌大的迷你主机，非常适合办公、家用，功耗低噪音小。95新成色，原装适配器。",
    },
    {
      categoryId: 1, brandId: 2,
      title: "戴尔 OptiPlex 3070 SFF 商务台式机",
      condition: "9成新", price: 2200,
      config: { cpu: "i5-9500", ram: "16G DDR4", disk: "512G NVMe" },
      status: "onsale",
      description: "戴尔商用机型，稳定耐用。小型机箱不占地方，企业批量淘汰成色不错。",
    },
    {
      categoryId: 1, brandId: 3,
      title: "惠普 EliteDesk 800 G4 工作站",
      condition: "95新", price: 2800,
      config: { cpu: "i7-8700", ram: "32G DDR4", disk: "512G NVMe + 1T HDD" },
      status: "onsale",
      description: "HP 工作站级别，i7-8700 六核十二线程，32G 大内存，双硬盘组合，适合设计师或程序员。",
    },
    {
      categoryId: 1, brandId: 4,
      title: "华硕 组装台式机 R5 5600G",
      condition: "95新", price: 3200,
      config: { cpu: "R5 5600G", ram: "16G DDR4 3200", disk: "1T NVMe", gpu: "集显" },
      status: "onsale",
      description: "R5 5600G 六核 APU，核显性能超过入门独显，LOL/CF 流畅运行。1T 大容量固态。",
    },
    {
      categoryId: 1, brandId: 17,
      title: "微星 组装台式机 i5-12400F + RTX 3060",
      condition: "95新", price: 5200,
      config: { cpu: "i5-12400F", ram: "32G DDR4 3200", disk: "1T NVMe", gpu: "RTX 3060 12G" },
      status: "onsale",
      description: "游戏主力机，i5-12400F 搭配 RTX 3060 12G，通吃 1080P 高画质3A大作，32G 大内存随便用。",
    },

    // --- 笔记本 (categoryId: 2) ---
    {
      categoryId: 2, brandId: 1,
      title: "联想 ThinkPad X1 Carbon Gen8",
      condition: "95新", price: 3500,
      config: { cpu: "i7-10510U", ram: "16G", disk: "512G NVMe", screen: "14寸 2K" },
      status: "onsale",
      description: "ThinkPad 旗舰商务本，仅重 1.09kg。14寸2K屏幕，键盘手感一流，电池续航约8小时。95新成色，无磕碰。",
    },
    {
      categoryId: 2, brandId: 2,
      title: "戴尔 XPS 13 9300",
      condition: "9成新", price: 3200,
      config: { cpu: "i7-1065G7", ram: "16G", disk: "512G NVMe", screen: "13.4寸 4K触控" },
      status: "onsale",
      description: "戴尔旗舰超极本，13.4寸4K触控屏窄边框惊艳。轻薄便携，适合出差/上学。轻微使用痕迹。",
    },
    {
      categoryId: 2, brandId: 3,
      title: "惠普 战66 三代 R5版",
      condition: "95新", price: 1800,
      config: { cpu: "R5 4500U", ram: "16G", disk: "512G NVMe", screen: "14寸 1080P" },
      status: "onsale",
      description: "高性价比商务本，R5 4500U 六核性能足够办公追剧。金属机身做工好，电池健康度高。",
    },
    {
      categoryId: 2, brandId: 4,
      title: "华硕 灵耀14 i5版",
      condition: "95新", price: 2500,
      config: { cpu: "i5-1135G7", ram: "16G", disk: "512G NVMe", screen: "14寸 1080P" },
      status: "onsale",
      description: "华硕灵耀系列，轻薄时尚。i5-1135G7 11代处理器，日常办公轻松应对，支持 WiFi 6。",
    },
    {
      categoryId: 2, brandId: 5,
      title: "苹果 MacBook Air M1 2020",
      condition: "95新", price: 3800,
      config: { cpu: "M1", ram: "8G", disk: "256G" },
      status: "onsale",
      description: "M1 芯片性能强劲功耗极低，无风扇设计零噪音。续航可达15小时，适合轻度办公和学生使用。",
    },
    {
      categoryId: 2, brandId: 5,
      title: "苹果 MacBook Pro 13 M1 2020",
      condition: "95新", price: 4800,
      config: { cpu: "M1", ram: "16G", disk: "512G" },
      status: "onsale",
      description: "M1 Pro 13寸，16G + 512G 高配版。Touch Bar，风扇主动散热持续性能更强。适合设计师/剪辑。",
    },
    {
      categoryId: 2, brandId: 6,
      title: "小米笔记本 Pro 15 2021",
      condition: "9成新", price: 2200,
      config: { cpu: "i5-11300H", ram: "16G", disk: "512G NVMe", screen: "15.6寸 3.5K OLED" },
      status: "onsale",
      description: "15.6寸 3.5K OLED 屏幕色准极佳，适合看视频/图片处理。H35 标压 i5 性能不错。",
    },
    {
      categoryId: 2, brandId: 1,
      title: "联想 小新 Pro 14 2022",
      condition: "95新", price: 3000,
      config: { cpu: "R7 6800HS", ram: "16G LPDDR5", disk: "512G NVMe", screen: "14寸 2.8K 120Hz" },
      status: "onsale",
      description: "小新 Pro 14 2022款，R7 6800HS + 2.8K 120Hz高刷屏，核显性能接近 MX350，可轻量游戏。",
    },

    // --- CPU (categoryId: 3) ---
    {
      categoryId: 3, brandId: 7,
      title: "Intel 酷睿 i5-12400F",
      condition: "95新", price: 680,
      config: { socket: "LGA1700", cores: "6核12线程", freq: "2.5-4.4GHz", tdp: "65W" },
      status: "onsale",
      description: "12代 i5，无核显版本需要独显。游戏性价比之王，散片拆机，成色好，盒装无。",
    },
    {
      categoryId: 3, brandId: 7,
      title: "Intel 酷睿 i7-12700KF",
      condition: "95新", price: 1480,
      config: { socket: "LGA1700", cores: "12核20线程", freq: "3.6-5.0GHz", tdp: "125W" },
      status: "onsale",
      description: "12代 i7 旗舰，8大核+4小核，游戏/生产力通吃。需搭配独显使用。",
    },
    {
      categoryId: 3, brandId: 7,
      title: "Intel 酷睿 i3-12100F",
      condition: "99新", price: 350,
      config: { socket: "LGA1700", cores: "4核8线程", freq: "3.3-4.3GHz", tdp: "60W" },
      status: "onsale",
      description: "入门游戏神U，单核性能强，配便宜独显就能畅玩网游。几乎全新拆机件。",
    },
    {
      categoryId: 3, brandId: 8,
      title: "AMD 锐龙 R5 5600",
      condition: "95新", price: 480,
      config: { socket: "AM4", cores: "6核12线程", freq: "3.5-4.4GHz", tdp: "65W" },
      status: "onsale",
      description: "AM4 平台六核主力，带核显，不插独显也能亮机。B450/B550 主板直接可用。",
    },
    {
      categoryId: 3, brandId: 8,
      title: "AMD 锐龙 R7 5700X",
      condition: "95新", price: 820,
      config: { socket: "AM4", cores: "8核16线程", freq: "3.4-4.6GHz", tdp: "65W" },
      status: "onsale",
      description: "AM4 八核甜品，65W低功耗版。生产力用户升级首选，无核显需配独显。",
    },

    // --- 显卡 (categoryId: 4) ---
    {
      categoryId: 4, brandId: 9,
      title: "NVIDIA GeForce GTX 1660 Super 6G",
      condition: "9成新", price: 580,
      config: { vram: "6G GDDR6", brand_model: "七彩虹战斧", power: "125W" },
      status: "onsale",
      description: "1080P 网游通吃，LOL/CSGO/永劫无间流畅运行。功耗低，单 8pin 供电，无矿历史。",
    },
    {
      categoryId: 4, brandId: 9,
      title: "NVIDIA GeForce RTX 2060 6G",
      condition: "9成新", price: 820,
      config: { vram: "6G GDDR6", brand_model: "华硕 Dual", power: "160W" },
      status: "onsale",
      description: "入门光追卡，支持 DLSS，1080P 中高画质 3A 大作无压力。成色好，风扇无噪音。",
    },
    {
      categoryId: 4, brandId: 9,
      title: "NVIDIA GeForce RTX 3060 12G",
      condition: "95新", price: 1350,
      config: { vram: "12G GDDR6", brand_model: "微星万图师", power: "170W" },
      status: "onsale",
      description: "12G 大显存，1080P 全高画质通吃，2K 中高也能打。非常抢手的甜品卡，非矿卡。",
    },
    {
      categoryId: 4, brandId: 8,
      title: "AMD Radeon RX 6600 8G",
      condition: "95新", price: 720,
      config: { vram: "8G GDDR6", brand_model: "蓝宝石白金", power: "132W" },
      status: "onsale",
      description: "A卡甜品，性能接近 RTX 3060，功耗更低。1080P 游戏好选择，支持 FSR。",
    },

    // --- 内存 (categoryId: 5) ---
    {
      categoryId: 5, brandId: 10,
      title: "金士顿 FURY DDR4 3200 16G 单条",
      condition: "99新", price: 150,
      config: { type: "DDR4", freq: "3200MHz", capacity: "16G", timing: "CL16" },
      status: "onsale",
      description: "金士顿骇客神条，16G 单条。99新拆机，带原装散热马甲，兼容性好。",
    },
    {
      categoryId: 5, brandId: 10,
      title: "金士顿 FURY DDR4 3200 8G×2 套条",
      condition: "95新", price: 260,
      config: { type: "DDR4", freq: "3200MHz", capacity: "8G×2", timing: "CL16" },
      status: "onsale",
      description: "双通道套条，同批次连号，开 XMP 直接 3200MHz。游戏玩家标配。",
    },
    {
      categoryId: 5, brandId: 11,
      title: "三星 DDR4 2666 16G 笔记本内存",
      condition: "95新", price: 130,
      config: { type: "DDR4 SODIMM", freq: "2666MHz", capacity: "16G" },
      status: "onsale",
      description: "笔记本升级专用，三星原厂颗粒稳定。16G 单条，适合老笔记本扩容。",
    },
    {
      categoryId: 5, brandId: 11,
      title: "三星 DDR4 3200 32G 笔记本内存",
      condition: "99新", price: 320,
      config: { type: "DDR4 SODIMM", freq: "3200MHz", capacity: "32G" },
      status: "onsale",
      description: "超大容量笔记本内存，32G 单条。程序员/虚拟机用户必备。99新拆机。",
    },

    // --- 硬盘 (categoryId: 6) ---
    {
      categoryId: 6, brandId: 11,
      title: "三星 980 Pro 1T NVMe SSD",
      condition: "95新", price: 380,
      config: { type: "NVMe M.2", capacity: "1T", speed: "读取7000MB/s", interface: "PCIe 4.0" },
      status: "onsale",
      description: "三星旗舰 PCIe 4.0 固态，健康度 95%+，写入量低。适合做系统盘或游戏盘。",
    },
    {
      categoryId: 6, brandId: 12,
      title: "西数 SN570 500G NVMe SSD",
      condition: "99新", price: 170,
      config: { type: "NVMe M.2", capacity: "500G", speed: "读取3500MB/s", interface: "PCIe 3.0" },
      status: "onsale",
      description: "西数蓝盘，性价比高。500G 做系统盘刚好，99新健康度几乎满的。",
    },
    {
      categoryId: 6, brandId: 13,
      title: "希捷 酷鱼 2T 机械硬盘",
      condition: "9成新", price: 200,
      config: { type: "3.5英寸 HDD", capacity: "2T", rpm: "7200RPM", interface: "SATA 3" },
      status: "onsale",
      description: "希捷酷鱼 2T，7200 转高速。适合做仓库盘存电影/游戏/资料。通电时间约5000小时。",
    },
    {
      categoryId: 6, brandId: 12,
      title: "西数 蓝盘 1T 机械硬盘",
      condition: "95新", price: 120,
      config: { type: "3.5英寸 HDD", capacity: "1T", rpm: "7200RPM", interface: "SATA 3" },
      status: "onsale",
      description: "西数蓝盘 1T，办公机/家用机标配存储盘。通电少，无坏道。",
    },

    // --- 显示器 (categoryId: 7) ---
    {
      categoryId: 7, brandId: 2,
      title: "戴尔 U2419H 24寸 IPS 专业显示器",
      condition: "95新", price: 550,
      config: { size: "24寸", panel: "IPS", resolution: "1920×1080", ports: "HDMI+DP+USB Hub" },
      status: "onsale",
      description: "戴尔 UltraSharp 系列，出厂校色 ΔE<2，适合设计/摄影后期。窄边框颜值高，支架可升降旋转。",
    },
    {
      categoryId: 7, brandId: 14,
      title: "AOC 27G2 27寸 144Hz 电竞显示器",
      condition: "9成新", price: 650,
      config: { size: "27寸", panel: "IPS", resolution: "1920×1080", refresh: "144Hz", ports: "HDMI+DP" },
      status: "onsale",
      description: "27寸 144Hz 电竞屏，1ms 响应，支持 FreeSync。FPS 玩家入门好选择，无坏点。",
    },
    {
      categoryId: 7, brandId: 1,
      title: "联想 L24q-35 24寸 2K 显示器",
      condition: "95新", price: 480,
      config: { size: "24寸", panel: "IPS", resolution: "2560×1440", ports: "HDMI+DP" },
      status: "onsale",
      description: "24寸 2K，像素密度高画面细腻。适合办公/看文档，比 1080P 舒服很多。75Hz 刷新。",
    },

    // --- 外设 (categoryId: 8) ---
    {
      categoryId: 8, brandId: 15,
      title: "罗技 MX Master 3 无线鼠标",
      condition: "95新", price: 280,
      config: { type: "无线鼠标", connection: "蓝牙+Unifying", dpi: "4000", battery: "内置充电" },
      status: "onsale",
      description: "罗技旗舰办公鼠标，MagSpeed 电磁滚轮超顺滑。人体工学握感极佳，续航约70天。有轻微使用痕迹。",
    },
    {
      categoryId: 8, brandId: 16,
      title: "樱桃 G80-3000 机械键盘 青轴",
      condition: "9成新", price: 230,
      config: { type: "机械键盘", switch: "Cherry MX 青轴", layout: "104键标准", connection: "有线" },
      status: "onsale",
      description: "樱桃经典原厂键盘，德国制造，打字神器。青轴段落感清脆，程序员/写手最爱。9成新键帽无打油。",
    },
    {
      categoryId: 8, brandId: 15,
      title: "罗技 G304 无线游戏鼠标",
      condition: "95新", price: 99,
      config: { type: "无线游戏鼠标", connection: "Lightspeed 2.4G", dpi: "12000", battery: "AA电池" },
      status: "onsale",
      description: "罗技入门无线游戏鼠，Lightspeed 1ms 响应延迟几乎为零。轻巧便携，续航约250小时。",
    },
    {
      categoryId: 8, brandId: 2,
      title: "戴尔 KM717 无线键鼠套装",
      condition: "95新", price: 120,
      config: { type: "无线键鼠套装", connection: "蓝牙+2.4G双模", layout: "全尺寸" },
      status: "onsale",
      description: "戴尔高端无线键鼠，支持蓝牙和 2.4G 双模切换。巧克力键帽打字安静，鼠标小巧。",
    },
  ]);

  // ===== 估价规则 =====
  await db.insert(schema.priceRules).values([
    // 整机
    {
      deviceType: "整机",
      basePrice: 1500,
      conditionFactor: { "99新": 0.90, "95新": 0.80, "9成新": 0.65, "8成新": 0.50 },
      configBonus: { "i5": 200, "i7": 600, "R5": 150, "R7": 500, "8G": 0, "16G": 150, "32G": 350, "256G": 0, "512G": 100, "1T": 200 },
    },
    // 笔记本
    {
      deviceType: "笔记本",
      brand: "苹果",
      model: "MacBook Air M1",
      basePrice: 4500,
      conditionFactor: { "99新": 0.92, "95新": 0.82, "9成新": 0.70, "8成新": 0.55 },
      configBonus: { "8G/256G": 0, "16G/256G": 400, "16G/512G": 1000, "16G/1T": 1600 },
    },
    {
      deviceType: "笔记本",
      brand: "苹果",
      model: "MacBook Pro 13 M1",
      basePrice: 5500,
      conditionFactor: { "99新": 0.92, "95新": 0.82, "9成新": 0.70, "8成新": 0.55 },
      configBonus: { "8G/256G": 0, "16G/512G": 1200, "16G/1T": 2000 },
    },
    {
      deviceType: "笔记本",
      brand: "联想",
      basePrice: 2000,
      conditionFactor: { "99新": 0.88, "95新": 0.78, "9成新": 0.65, "8成新": 0.50 },
      configBonus: { "i5": 0, "i7": 400, "R5": 0, "R7": 350, "8G": 0, "16G": 150, "512G": 0, "1T": 150 },
    },
    {
      deviceType: "笔记本",
      brand: "戴尔",
      basePrice: 2200,
      conditionFactor: { "99新": 0.88, "95新": 0.78, "9成新": 0.65, "8成新": 0.50 },
      configBonus: { "i5": 0, "i7": 450, "8G": 0, "16G": 150, "512G": 0, "1T": 150 },
    },
    {
      deviceType: "笔记本",
      basePrice: 1500,
      conditionFactor: { "99新": 0.88, "95新": 0.78, "9成新": 0.65, "8成新": 0.50 },
      configBonus: { "i5": 0, "i7": 350, "R5": 0, "R7": 300, "8G": 0, "16G": 150, "512G": 0, "1T": 150 },
    },
    // CPU
    {
      deviceType: "CPU",
      basePrice: 400,
      conditionFactor: { "99新": 0.95, "95新": 0.85, "9成新": 0.75, "8成新": 0.60 },
      configBonus: { "i3": -100, "i5": 0, "i7": 500, "i9": 1000, "R5": 0, "R7": 400, "R9": 900 },
    },
    // 显卡
    {
      deviceType: "显卡",
      basePrice: 600,
      conditionFactor: { "99新": 0.93, "95新": 0.83, "9成新": 0.70, "8成新": 0.55 },
      configBonus: { "4G": -200, "6G": 0, "8G": 200, "12G": 500, "16G": 800, "24G": 1500 },
    },
    // 显示器
    {
      deviceType: "显示器",
      basePrice: 400,
      conditionFactor: { "99新": 0.90, "95新": 0.80, "9成新": 0.70, "8成新": 0.55 },
      configBonus: { "24寸": 0, "27寸": 150, "32寸": 350, "1080P": 0, "2K": 150, "4K": 400, "60Hz": 0, "144Hz": 200 },
    },
  ]);

  // ===== 回收订单 =====
  await db.insert(schema.recycleOrders).values([
    {
      deviceType: "笔记本", brand: "苹果", model: "MacBook Pro 13",
      config: { cpu: "M1", ram: "8G", disk: "256G" },
      condition: "95新", buyYear: 2021,
      contactPhone: "139****8888", contactWechat: "user_wx_001",
      status: "pending", estMode: "rule",
      estRange: { min: 3500, max: 4200 },
    },
    {
      deviceType: "笔记本", brand: "联想", model: "ThinkPad X1 Carbon",
      config: { cpu: "i7-10510U", ram: "16G", disk: "512G" },
      condition: "9成新", buyYear: 2020,
      contactPhone: "189****6666",
      status: "quoted", estMode: "rule",
      estRange: { min: 2500, max: 3200 },
      finalPrice: 2800,
    },
    {
      deviceType: "整机", brand: "华硕",
      config: { cpu: "R5 3600", ram: "16G", disk: "512G", gpu: "GTX 1660 Super" },
      condition: "9成新", buyYear: 2021,
      contactPhone: "136****3333", contactWechat: "gamer_wx",
      status: "deal", estMode: "rule",
      estRange: { min: 2000, max: 2800 },
      finalPrice: 2400,
    },
    {
      deviceType: "CPU", brand: "Intel", model: "i7-12700KF",
      config: { socket: "LGA1700" },
      condition: "95新", buyYear: 2023,
      contactPhone: "150****1111",
      status: "cancel", estMode: "manual",
      finalPrice: 1400,
      note: "用户取消，已在其他地方出售",
    },
    {
      deviceType: "显卡", brand: "NVIDIA", model: "RTX 2060",
      config: { vram: "6G" },
      condition: "9成新", buyYear: 2020,
      contactPhone: "177****5555",
      status: "pending", estMode: "manual",
      estRange: { min: 700, max: 900 },
    },
  ]);

  // ===== 留言咨询 =====
  await db.insert(schema.messages).values([
    {
      productId: 7,
      content: "老板这款 X1 Carbon 屏幕有无坏点？电池循环次数多少？",
      contact: "135****2345",
      handled: false,
    },
    {
      productId: 12,
      content: "i5-12400F 还在吗？配 B660 主板可以吗？",
      contact: "186****7890",
      handled: true,
    },
    {
      content: "请问支持以旧换新吗？我有台老款戴尔笔记本想置换",
      contact: "138****4567",
      handled: false,
    },
  ]);

  // ===== 店铺设置 =====
  await db.insert(schema.shopSettings).values({
    id: 1,
    phone: "1385730XXXX",
    wechatQr: "",
    address: "浙江省桐乡市XX路XX号",
    hours: "周一至周日 9:00 - 21:00",
    intro: "桐乡本地二手电脑回收与出售。主营二手笔记本、台式机、电脑配件，所有商品均经过检测，成色如实描述。支持线下看货、当面交易，让您买得放心。同时提供高价上门回收服务，闲置电脑不用吃灰。",
    recycleScope: "笔记本 / 台式整机 / CPU / 显卡 / 内存 / 硬盘 / 显示器 / 键盘鼠标",
    announcement: "新到一批 ThinkPad X1 Carbon 办公本，成色好价格优！",
  });
}
