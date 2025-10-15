import type { SVGProps } from "react";

export function LockerLeaseLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width={props.width || "1em"}
            height={props.height || "1em"}
            {...props}
        >
            <rect width="256" height="256" fill="none" />
            <rect
                x="40"
                y="40"
                width="176"
                height="176"
                rx="8"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <circle
                cx="128"
                cy="128"
                r="32"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            <path
                d="M128 160v24"
                stroke="currentColor"
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </svg>
    )
}
