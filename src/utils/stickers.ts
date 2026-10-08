export interface StickerInfo {
  id: string;
  name: string;
  url: string;
  tag: 'bubu_solo' | 'dudu_solo' | 'couple';
  categoryLabel: string;
  description: string;
}

export const BUBU_DUDU_STICKERS: StickerInfo[] = [
  // --- Bubu Solo Characters ---
  {
    id: 'bubu_solo_hat',
    name: 'Bubu Tung Tăng (Nón Xanh & Túi Vàng)',
    url: '/stickers/bubu_solo_hat.png',
    tag: 'bubu_solo',
    categoryLabel: 'Bubu Một Mình',
    description: 'Bubu đội nón mint, đeo túi vàng thè lưỡi siêu nhí nhảnh',
  },
  {
    id: 'bubu_solo_skincare',
    name: 'Bubu Điệu Đà (Băng Đô Nơ Hồng)',
    url: '/stickers/bubu_solo_skincare.png',
    tag: 'bubu_solo',
    categoryLabel: 'Bubu Một Mình',
    description: 'Bubu đeo nơ hồng dặm phấn làm đẹp xinh xắn',
  },
  {
    id: 'bubu_mochi',
    name: 'Bubu Bánh Mochi Tròn Xoe',
    url: '/stickers/bubu_mochi.png',
    tag: 'bubu_solo',
    categoryLabel: 'Bubu Một Mình',
    description: 'Bubu trắng tròn ú nu như viên bánh mochi',
  },

  // --- Dudu Solo Characters ---
  {
    id: 'dudu_solo_bag',
    name: 'Dudu Hớn Hở (Túi Mint Chỉ Đường)',
    url: '/stickers/dudu_solo_bag.png',
    tag: 'dudu_solo',
    categoryLabel: 'Dudu Một Mình',
    description: 'Dudu đeo túi xanh mint, giơ tay dẫn đường đầy hứng khởi',
  },
  {
    id: 'dudu_solo_grumpy',
    name: 'Dudu Chống Nạnh Cáu Kỉnh',
    url: '/stickers/dudu_solo_grumpy.png',
    tag: 'dudu_solo',
    categoryLabel: 'Dudu Một Mình',
    description: 'Dudu hờn dỗi, bĩu môi chống nạnh nhắc nhở dễ thương',
  },
  {
    id: 'dudu_mochi',
    name: 'Dudu Bánh Mochi Nâu Ấm',
    url: '/stickers/dudu_mochi.png',
    tag: 'dudu_solo',
    categoryLabel: 'Dudu Một Mình',
    description: 'Dudu nâu tròn xoe ngồi ngoan ngoãn',
  },

  // --- Cặp Đôi Bubu & Dudu (Couple) ---
  {
    id: 'bubu_dudu_pair',
    name: 'Bubu Dudu Đi Chơi Cùng Nhau',
    url: '/stickers/bubu_dudu_pair.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Bubu đội nón xanh cùng Dudu tung tăng dạo phố',
  },
  {
    id: 'walking_flag',
    name: 'Dẫn Đường Dã Ngoại',
    url: '/stickers/walking_flag.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Bubu phất cờ dẫn Dudu đi thám hiểm',
  },
  {
    id: 'massage',
    name: 'Massage Đấm Lưng',
    url: '/stickers/massage.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Bubu mát-xa lưng cho Dudu nằm êm ái trên gối',
  },
  {
    id: 'gardening_housework',
    name: 'Cùng Nhau Chăm Cây',
    url: '/stickers/gardening_housework.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Bubu & Dudu tưới cây và chăm sóc vườn nhà',
  },
  {
    id: 'flowers_love',
    name: 'Tặng Hoa Yêu Thương',
    url: '/stickers/flowers_love.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Dudu tặng bó hoa hồng rực rỡ, Bubu mừng rỡ nhảy cẫng',
  },
  {
    id: 'cuddle_mochi',
    name: 'Hai Cục Bột Tròn Xoe',
    url: '/stickers/cuddle_mochi.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Bubu & Dudu tựa vào nhau tròn xoe như viên mochi',
  },
  {
    id: 'warm_hug',
    name: 'Cái Ôm Siêu Ấm Áp',
    url: '/stickers/warm_hug.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Cặp đôi ôm chặt nhau đầy tình cảm',
  },
  {
    id: 'scooter_ride',
    name: 'Lượn Xe Scooter',
    url: '/stickers/scooter_ride.png',
    tag: 'couple',
    categoryLabel: 'Cặp Đôi Bubu & Dudu',
    description: 'Dudu lái xe trượt chở Bubu ôm sau lưng vi vu',
  },
];
