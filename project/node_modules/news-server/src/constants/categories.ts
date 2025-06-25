/**
 * Main categories for the news application
 */
export const MAIN_CATEGORIES = [
    'thoi-su',      // Current affairs
    'the-gioi',     // World
    'kinh-doanh',   // Business
    'giai-tri',     // Entertainment
    'the-thao',     // Sports
    'phap-luat',    // Law
    'giao-duc',     // Education
    'suc-khoe',     // Health
    'doi-song',     // Lifestyle
    'du-lich',      // Travel
    'khoa-hoc',     // Science
    'cong-nghe',    // Technology
    'xe',           // Vehicles
    'y-kien',       // Opinion
    'tam-su'        // Confessions
] as const;

/**
 * Category IDs mapping for Tuoi Tre News
 * Maps category slugs to their corresponding numeric IDs
 */
export const CATEGORY_IDS: Record<string, number> = {
    // Main categories
    'thoi-su': 1,           // Current affairs
    'the-gioi': 2,          // World
    'kinh-doanh': 3,        // Business
    'giai-tri': 4,          // Entertainment
    'the-thao': 5,          // Sports
    'phap-luat': 6,         // Law
    'giao-duc': 7,          // Education
    'suc-khoe': 8,          // Health
    'doi-song': 9,          // Lifestyle
    'du-lich': 10,          // Travel
    'khoa-hoc': 11,         // Science
    'cong-nghe': 12,        // Technology
    'xe': 13,               // Vehicles
    'y-kien': 14,           // Opinion
    'tam-su': 15,           // Confessions
    'cuoi': 16,             // Humor
    
    // Sub-categories
    'the-gioi-tre': 17,     // Youth
    'tam-long-nhan-ai': 18, // Kindness
    'ban-doc': 19,          // Readers
    'goc-nhin': 20,         // Perspectives
    'tinh-yeu-gioi-tinh': 21, // Love and Sex
    'am-thuc': 22,          // Cuisine
    'lam-dep': 23,          // Beauty
    'thi-truong-tieu-dung': 24, // Consumer Market
    'tinh-yeu': 25,         // Love
    'doi-song-gia-dinh': 26, // Family Life
    'kham-pha': 27,         // Discovery
    'the-gioi-sao': 28,     // Celebrity
    'the-gioi-do-day': 29,  // Gadgets
    'the-gioi-tre-em': 30,  // Kids
    'the-gioi-gai-xinh': 31, // Beautiful Girls
    'the-gioi-phim': 32,    // Movies
    'the-gioi-nhac': 33,    // Music
    'the-gioi-thoi-trang': 34, // Fashion
    'the-gioi-sach': 35,    // Books
    'bat-dong-san': 36,     // Real Estate
    'tai-chinh': 37,        // Finance
    'tuyen-sinh': 38,       // Admissions
    'du-hoc': 39,           // Study Abroad
    'kien-thuc': 40,        // Knowledge
    'chuyen-la': 41,        // Weird News
    'an-ninh-hinh-su': 42,  // Criminal Security
    'phap-dinh': 43,        // Court
    'the-thao-viet-nam': 44, // Vietnamese Sports
    'bong-da': 45,          // Football
    'tennis': 46,           // Tennis
    'golf': 47,             // Golf
    'the-thao-khac': 48    // Other Sports
};
