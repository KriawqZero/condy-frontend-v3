type LogoutIconProps = {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  fill?: string;
};

export const LogoutIcon = ({
  width = 40,
  height = 40,
  className,
  color = "currentColor",
  fill = "none",
}: LogoutIconProps) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M23.2532 19.4934L26.6665 16.0801L23.2532 12.6667"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.0134 16.0801H26.5734"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6801 26.6666C9.78676 26.6666 5.01343 22.6666 5.01343 15.9999C5.01343 9.33325 9.78676 5.33325 15.6801 5.33325"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
