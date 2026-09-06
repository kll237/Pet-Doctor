/**
 * 统一的宠物/医生头像渲染：
 * - 如果 avatar 是图片 URL（http/https 或 /cats/...），显示图片；
 * - 否则按文本渲染（兼容 emoji 等回退场景）。
 *
 * 圆角/裁剪/阴影由外层 className 控制。
 */

export function PetAvatar({
  src,
  className,
  imgClassName,
  alt = '',
}: {
  src: string
  className?: string
  imgClassName?: string
  alt?: string
}) {
  const isImage = isImageSrc(src)
  if (isImage) {
    return (
      <div className={className}>
        <img
          src={src}
          alt={alt}
          className={`h-full w-full object-cover ${imgClassName ?? ''}`}
          draggable={false}
        />
      </div>
    )
  }
  return (
    <div className={`${className ?? ''} grid place-items-center`}>
      <span className="leading-none">{src}</span>
    </div>
  )
}

function isImageSrc(s: string) {
  if (!s) return false
  if (s.startsWith('/') || /^https?:/.test(s) || /^data:image/.test(s)) return true
  return false
}
