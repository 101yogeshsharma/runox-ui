"use client";
import { Flex } from "../../atoms/Flex";
import { Box } from "../../atoms/Box";

import React from "react";
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../utils/cn";
import { Text } from "../../atoms/Text";
import { rnx } from "../../utils/rnx";

import "./Chart.css";

/**
 * Props for the Chart component.
 */
export interface ChartProps {
  data: Record<string, unknown>[];
  index: string;
  categories: string[];
  colors?: string[];
  className?: string;
  valueFormatter?: (value: number) => string;
}

const defaultColors = [
  "var(--info)",
  "var(--success)",
  "var(--warning)",
  "var(--destructive)",
  "var(--ai)",
];

const CustomTooltip = ({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { color: string; name: string; value: number | string }[];
  label?: string;
  valueFormatter?: (value: number) => string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Box className="rnx-chart-tooltip">
        <Text
          as="p"
          variant="body"
          className="rnx-chart-tooltip-title"
        >
          {label}
        </Text>
        {payload.map((p, i: number) => (
          <Flex key={i} align="center" gap="sm" className="text-sm">
            <Box
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <Box as="span" className="text-muted-foreground">
              {p.name}:
            </Box>
            <Box as="span" className="text-foreground font-medium">
              {valueFormatter && typeof p.value === "number"
                ? valueFormatter(p.value)
                : p.value}
            </Box>
          </Flex>
        ))}
      </Box>
    );
  }
  return null;
};

export const LineChart = ({
  data,
  index,
  categories,
  colors = defaultColors,
  className,
  valueFormatter,
}: ChartProps) => {
  return (
    <Box {...rnx({ component: 'Chart' })} className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="opacity-10"
          />
          <XAxis
            dataKey={index}
            stroke="currentColor"
            className="text-xs opacity-50"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            className="text-xs opacity-50"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip valueFormatter={valueFormatter} />}
          />
          {categories.map((cat, i) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={false}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const BarChart = ({
  data,
  index,
  categories,
  colors = defaultColors,
  className,
  valueFormatter,
}: ChartProps) => {
  return (
    <Box {...rnx({ component: 'Chart' })} className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="opacity-10"
          />
          <XAxis
            dataKey={index}
            stroke="currentColor"
            className="text-xs opacity-50"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            className="text-xs opacity-50"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--foreground)", opacity: 0.05 }}
            content={<CustomTooltip valueFormatter={valueFormatter} />}
          />
          {categories.map((cat, i) => (
            <Bar
              key={cat}
              dataKey={cat}
              fill={colors[i % colors.length]}
              radius={[6, 6, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const AreaChart = ({
  data,
  index,
  categories,
  colors = defaultColors,
  className,
  valueFormatter,
}: ChartProps) => {
  const chartId = React.useId().replace(/:/g, "");
  return (
    <Box {...rnx({ component: 'Chart' })} className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            {categories.map((cat, i) => (
              <linearGradient
                key={`color-${chartId}-${cat}`}
                id={`color-${chartId}-${cat}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colors[i % colors.length]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={colors[i % colors.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="currentColor"
            className="opacity-10"
          />
          <XAxis
            dataKey={index}
            stroke="currentColor"
            className="text-xs opacity-50"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            className="text-xs opacity-50"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip valueFormatter={valueFormatter} />}
          />
          {categories.map((cat, i) => (
            <Area
              key={cat}
              type="monotone"
              dataKey={cat}
              stroke={colors[i % colors.length]}
              fillOpacity={1}
              fill={`url(#color-${chartId}-${cat})`}
              strokeWidth={2}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  className?: string;
  valueFormatter?: (value: number) => string;
  showLegend?: boolean;
  innerRadius?: number;
}

const CustomPieTooltip = ({
  active,
  payload,
  valueFormatter,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
  valueFormatter?: (value: number) => string;
}) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    return (
      <Box className="rnx-chart-tooltip">
        <Flex align="center" gap="sm" className="text-sm">
          <Box
            className="h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: entry.payload.fill }}
          />
          <Box as="span" className="text-muted-foreground">
            {entry.name}:
          </Box>
          <Box as="span" className="text-foreground font-medium">
            {valueFormatter ? valueFormatter(entry.value) : entry.value}
          </Box>
        </Flex>
      </Box>
    );
  }
  return null;
};

export const PieChart = ({
  data,
  colors = defaultColors,
  className,
  valueFormatter,
  showLegend = true,
  innerRadius = 0,
}: PieChartProps) => {
  return (
    <Box {...rnx({ component: 'Chart' })} className={cn("h-72 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell
                key={`cell-${i}`}
                fill={colors[i % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            content={<CustomPieTooltip valueFormatter={valueFormatter} />}
          />
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <Box as="span" className="text-muted-foreground text-xs">
                  {value}
                </Box>
              )}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const Chart = Object.assign(
  {},
  {
    Line: LineChart,
    Bar: BarChart,
    Area: AreaChart,
    Pie: PieChart,
  }
);
