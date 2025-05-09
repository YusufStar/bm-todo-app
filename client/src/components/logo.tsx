import Link from "next/link";

export default function Logo({
  size,
  width = 24,
  height = 24,
  noIcon = false,
  noText = false,
  svgclassname = "",
  href = "/",
}: {
  size?: number;
  width?: number;
  height?: number;
  noText?: boolean;
  noIcon?: boolean;
  svgclassname?: string;
  href?: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-2 self-center font-medium">
      <div className="flex items-center gap-2">
        {!noIcon && (
          <svg
            fill="none"
            height={size || height}
            viewBox="0 0 32 32"
            width={size || width}
            className={svgclassname}
          >
            <path
              clipRule="evenodd"
              d="M6 7h20v3H6V7zm0 8h9v10H6V15zm12 0h8v4h-8v-4zm0 6h8v4h-8v-4z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        )}

        {!noText && (
          <span>B&M</span>
        )}
      </div>
    </Link>
  );
}
