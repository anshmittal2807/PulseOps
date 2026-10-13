const PRIMARY = "#2563EB";
const SUCCESS = "#059669";
const WARNING = "#D97706";
const ERROR = "#DC2626";
const MUTED = "#64748B";
const GRID = "#CBD5E1";
const BAR_COLORS = [PRIMARY, "#7C3AED", "#0F766E"];

function LineChart({ data, labels }) {
    const values = data || [];
    const xLabels = labels || [];
    const width = 320;
    const height = 140;
    const padding = 24;

    if (values.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-xs text-on-surface-variant text-center px-6">No latency samples recorded yet.<br />Checks are recorded automatically on schedule.</p>
            </div>
        );
    }

    const maxValue = Math.max(...values, 1);

    // Scale samples into the SVG drawing area while reserving the bottom
    // strip for time labels; a single sample sits at the left padding.
    const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;
    const stepY = (height - padding * 2 - 16) / maxValue;

    const points = values.map((value, index) => ({
        x: padding + index * stepX,
        y: height - padding - value * stepY,
        value,
    }));

    const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {[0.25, 0.5, 0.75].map((fraction) => (
                <line
                    key={fraction}
                    x1={padding}
                    x2={width - padding}
                    y1={height - padding - fraction * maxValue * stepY}
                    y2={height - padding - fraction * maxValue * stepY}
                    stroke={GRID}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                />
            ))}
            <polyline points={linePoints} fill="none" stroke={PRIMARY} strokeWidth="1.5" />
            {points.map((p, index) => (
                <circle key={index} cx={p.x} cy={p.y} r="2" fill={PRIMARY} />
            ))}
            {xLabels.map((label, index) => (
                <text key={`${label}-${index}`} x={padding + index * stepX} y={height - 8} textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="IBM Plex Mono">
                    {label}
                </text>
            ))}
        </svg>
    );
}

function DoughnutChart({ data, colors, labels }) {
    const values = data || [0, 0, 0];
    const segmentColors = colors || [SUCCESS, WARNING, ERROR];
    const segmentDotClasses = ["bg-success", "bg-warning", "bg-error"];
    const segmentLabels = labels || ["Healthy", "Warning", "Offline"];
    const total = values.reduce((sum, value) => sum + value, 0);

    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-xs text-on-surface-variant text-center px-6">No monitors yet.<br />Add one to see the health split.</p>
            </div>
        );
    }
    const center = 50;
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const thickness = 14;

    // Each SVG circle draws only its share of the circumference. Its offset
    // starts where all earlier segments ended, forming one continuous ring.
    const segments = values.map((value, index) => {
        const dash = (value / total) * circumference;
        const priorDash = values
            .slice(0, index)
            .reduce((sum, prior) => sum + (prior / total) * circumference, 0);
        return {
            dash,
            offset: -priorDash,
            color: segmentColors[index],
            dotClass: segmentDotClasses[index] || "bg-offline",
            label: segmentLabels[index],
            value,
        };
    });

    return (
        <div className="flex items-center justify-center gap-4">
            <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0">
                <g transform={`rotate(-90 ${center} ${center})`}>
                    {segments.map((segment) => (
                        <circle
                            key={segment.label}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="none"
                            stroke={segment.color}
                            strokeWidth={thickness}
                            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
                            strokeDashoffset={segment.offset}
                        />
                    ))}
                </g>
            </svg>
            <ul className="flex flex-col gap-1">
                {segments.map((segment) => (
                    <li key={segment.label} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${segment.dotClass}`}></span>
                        <span className="text-on-surface-variant">{segment.label}</span>
                        <span className="font-mono text-on-surface">{segment.value}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function BarChart({ data, labels }) {
    const values = data || [];
    const xLabels = labels || [];
    const width = 320;
    const height = 140;
    const padding = 24;

    if (values.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p className="text-xs text-on-surface-variant text-center px-6">No latency data yet.<br />Recorded checks will appear here.</p>
            </div>
        );
    }

    const maxValue = Math.max(...values, 1);
    const barGap = 24;
    // Divide the available plot width evenly after accounting for gaps.
    const barWidth = (width - padding * 2 - barGap * (values.length - 1)) / values.length;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {[0.25, 0.5, 0.75].map((fraction) => (
                <line
                    key={fraction}
                    x1={padding}
                    x2={width - padding}
                    y1={height - padding - fraction * maxValue * ((height - padding * 2 - 16) / maxValue)}
                    y2={height - padding - fraction * maxValue * ((height - padding * 2 - 16) / maxValue)}
                    stroke={GRID}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                />
            ))}
            {values.map((value, index) => {
                const barHeight = (value / maxValue) * (height - padding * 2 - 16);
                const x = padding + index * (barWidth + barGap);
                const y = height - padding - barHeight;
                const color = BAR_COLORS[index % BAR_COLORS.length];
                return (
                    <g key={index}>
                        <rect x={x} y={padding} width={barWidth} height={height - padding * 2 - 16} rx="3" fill={color} opacity="0.08" />
                        <rect x={x} y={y} width={barWidth} height={barHeight} rx="3" fill={color} />
                        <circle cx={x + barWidth / 2} cy={y - 7} r="2" fill={color} />
                        <text x={x + barWidth / 2} y={y - 12} textAnchor="middle" fontSize="9" fill={color} fontWeight="600" fontFamily="IBM Plex Mono">
                            {value}
                        </text>
                        <text x={x + barWidth / 2} y={height - 8} textAnchor="middle" fontSize="9" fill={color} fontWeight="600" fontFamily="Inter">
                            {xLabels[index]}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export { LineChart, DoughnutChart, BarChart };
