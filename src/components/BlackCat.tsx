/**
 * 一只黑色猫的 SVG - 用于医生头像、空状态
 * size: 像素大小
 */
export default function BlackCat({ size = 64 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      {/* 身体/头 */}
      <circle cx="32" cy="36" r="20" fill="#1F1B14" />
      {/* 双耳 */}
      <path d="M14 24 l4 -14 8 8 z" fill="#1F1B14" />
      <path d="M50 24 l-4 -14 -8 8 z" fill="#1F1B14" />
      {/* 内耳 */}
      <path d="M16 22 l3 -9 5 5 z" fill="#F5BEBE" opacity="0.55" />
      <path d="M48 22 l-3 -9 -5 5 z" fill="#F5BEBE" opacity="0.55" />
      {/* 黄色大眼 */}
      <circle cx="25" cy="34" r="4.2" fill="#F4A12C" />
      <circle cx="39" cy="34" r="4.2" fill="#F4A12C" />
      {/* 瞳孔 */}
      <ellipse cx="25" cy="34" rx="1.4" ry="3" fill="#1F1B14" />
      <ellipse cx="39" cy="34" rx="1.4" ry="3" fill="#1F1B14" />
      {/* 眼睛高光 */}
      <circle cx="26.2" cy="32.6" r="0.8" fill="#fff" />
      <circle cx="40.2" cy="32.6" r="0.8" fill="#fff" />
      {/* 鼻子 */}
      <path d="M30 40 Q32 42 34 40 L33 41.5 L32 42.5 L31 41.5 z" fill="#FF8FA8" />
      {/* 嘴 */}
      <path d="M28 43 Q32 46 36 43" stroke="#fff" strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* 胡须 */}
      <path d="M14 40 H22 M14 43 H22 M50 40 H42 M50 43 H42" stroke="#fff" strokeWidth="0.6" strokeLinecap="round" />
      {/* 白衣领（仅医生身份用） */}
      <path d="M18 56 Q32 52 46 56 L46 60 H18 z" fill="#fff" />
      <path d="M28 56 L32 60 L36 56" stroke="#3FA7E5" strokeWidth="1" fill="none" />
    </svg>
  )
}
