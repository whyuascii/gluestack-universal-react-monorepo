import { useBreakpointValue, getBreakPointValue } from "@gluestack-ui/utils/hooks";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import React, { useState, createContext, useContext, useMemo, forwardRef } from "react";
import { View, Dimensions, Platform, type ViewProps } from "react-native";
import { gridStyle, gridItemStyle } from "./styles";
const { width: DEVICE_WIDTH } = Dimensions.get("window");

/** Breakpoint value map type used by gluestack hooks */
type BreakpointMap = Partial<Record<string, unknown>>;

/** Grid context shape */
interface GridContextValue {
  calculatedWidth: number | null;
  numColumns: number;
  itemsPerRow: Record<number, number[]>;
  flexDirection: "row" | "column" | "row-reverse" | "column-reverse";
  gap: number;
  columnGap: number;
}

const GridContext = createContext<GridContextValue>({
  calculatedWidth: null,
  numColumns: 12,
  itemsPerRow: {},
  flexDirection: "row",
  gap: 0,
  columnGap: 0,
});
function arrangeChildrenIntoRows({
  childrenArray,
  colSpanArr,
  numColumns,
}: {
  childrenArray: React.ReactNode[];
  colSpanArr: number[];
  numColumns: number;
}) {
  let currentRow = 1;
  let currentRowTotalColSpan = 0;
  // store how many items in each row
  const rowItemsCount: {
    [key: number]: number[];
  } = {};
  for (let i = 0; i < childrenArray.length; i++) {
    const colSpan = colSpanArr[i];
    // if current row is full, go to next row
    if (currentRowTotalColSpan + colSpan > numColumns) {
      currentRow++;
      currentRowTotalColSpan = colSpan;
    } else {
      // if current row is not full, add colSpan to current row
      currentRowTotalColSpan += colSpan;
    }
    rowItemsCount[currentRow] = rowItemsCount[currentRow] ? [...rowItemsCount[currentRow], i] : [i];
  }
  return rowItemsCount;
}
function generateResponsiveNumColumns({ gridClass }: { gridClass: string }): BreakpointMap | null {
  const gridClassNamePattern = /\b(?:\w+:)?grid-cols-?\d+\b/g;
  const numColumns = gridClass?.match(gridClassNamePattern);
  if (!numColumns) {
    return null;
  }
  const regex = /^(?:(\w+):)?grid-cols-?(\d+)$/;
  const result: Record<string, number> = {};
  numColumns.forEach((classname) => {
    const match = classname.match(regex);
    if (match) {
      const prefix = match[1] || "default";
      const value = parseInt(match[2], 10);
      result[prefix] = value;
    }
  });
  return result;
}

function generateResponsiveColSpans({
  gridItemClassName,
}: {
  gridItemClassName: string;
}): BreakpointMap | null {
  const gridClassNamePattern = /\b(?:\w+:)?col-span-?\d+\b/g;
  const colSpanMatches = gridItemClassName?.match(gridClassNamePattern);
  if (!colSpanMatches) {
    return null;
  }
  const regex = /^(?:(\w+):)?col-span-?(\d+)$/;
  const result: Record<string, number> = {};
  colSpanMatches.forEach((classname) => {
    const match = classname.match(regex);
    if (match) {
      const prefix = match[1] || "default";
      const value = parseInt(match[2], 10);
      result[prefix] = value;
    }
  });
  return result;
}
type IGridProps = ViewProps &
  VariantProps<typeof gridStyle> & {
    gap?: number;
    rowGap?: number;
    columnGap?: number;
    flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
    padding?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingStart?: number;
    paddingEnd?: number;
    borderWidth?: number;
    borderLeftWidth?: number;
    borderRightWidth?: number;
    _extra: {
      className: string;
    };
  };
const Grid = forwardRef<React.ComponentRef<typeof View>, IGridProps>(function Grid(
  { className, _extra, children, ...props },
  ref
) {
  const [calculatedWidth, setCalculatedWidth] = useState<number | null>(null);
  const gridClass = _extra?.className;
  const breakpointMap = generateResponsiveNumColumns({ gridClass });
  const breakpointValue = useBreakpointValue(breakpointMap ?? { default: 12 });
  const responsiveNumColumns = (
    typeof breakpointValue === "number" ? breakpointValue : 12
  ) as number;
  const itemsPerRow = useMemo(() => {
    // get the colSpan of each child
    const colSpanArr =
      React.Children.map(children, (child) => {
        const childElement = child as React.ReactElement<{
          _extra?: { className?: string };
        }> | null;
        const gridItemClassName = childElement?.props?._extra?.className ?? "";
        const colSpanMap = generateResponsiveColSpans({ gridItemClassName });
        const colSpan2 = colSpanMap ? getBreakPointValue(colSpanMap, DEVICE_WIDTH) : 1;
        const colSpan = typeof colSpan2 === "number" ? colSpan2 : 1;
        if (colSpan > responsiveNumColumns) {
          return responsiveNumColumns;
        }
        return colSpan;
      }) ?? [];
    const childrenArray = React.Children.toArray(children);
    const rowItemsCount = arrangeChildrenIntoRows({
      childrenArray,
      colSpanArr: colSpanArr as number[],
      numColumns: responsiveNumColumns,
    });
    return rowItemsCount;
  }, [responsiveNumColumns, children]);
  const childrenWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { key: index, index: index } as {
        key: number;
        index: number;
      });
    }
    return child;
  });
  const gridClassMerged = `${Platform.select({
    web: gridClass ?? "",
  })}`;
  const contextValue = useMemo(() => {
    return {
      calculatedWidth,
      numColumns: responsiveNumColumns,
      itemsPerRow,
      flexDirection: props?.flexDirection || "row",
      gap: props?.gap || 0,
      columnGap: props?.columnGap || 0,
    };
  }, [calculatedWidth, itemsPerRow, responsiveNumColumns, props]);
  const borderLeftWidth = props?.borderLeftWidth || props?.borderWidth || 0;
  const borderRightWidth = props?.borderRightWidth || props?.borderWidth || 0;
  const borderWidthToSubtract = borderLeftWidth + borderRightWidth;
  return (
    <GridContext.Provider value={contextValue}>
      <View
        ref={ref}
        className={gridStyle({
          class: className + " " + gridClassMerged,
        })}
        onLayout={(event) => {
          const paddingLeftToSubtract =
            props?.paddingStart || props?.paddingLeft || props?.padding || 0;
          const paddingRightToSubtract =
            props?.paddingEnd || props?.paddingRight || props?.padding || 0;
          const gridWidth =
            Math.floor(event.nativeEvent.layout.width) -
            paddingLeftToSubtract -
            paddingRightToSubtract -
            borderWidthToSubtract;
          setCalculatedWidth(gridWidth);
        }}
        {...props}
      >
        {calculatedWidth && childrenWithProps}
      </View>
    </GridContext.Provider>
  );
});
cssInterop(Grid, {
  className: {
    target: "style",
    nativeStyleToProp: {
      gap: "gap",
      rowGap: "rowGap",
      columnGap: "columnGap",
      flexDirection: "flexDirection",
      padding: "padding",
      paddingLeft: "paddingLeft",
      paddingRight: "paddingRight",
      paddingStart: "paddingStart",
      paddingEnd: "paddingEnd",
      borderWidth: "borderWidth",
      borderLeftWidth: "borderLeftWidth",
      borderRightWidth: "borderRightWidth",
    },
  },
});
type IGridItemProps = ViewProps &
  VariantProps<typeof gridItemStyle> & {
    index?: number;
    _extra: {
      className: string;
    };
  };
const GridItem = forwardRef<React.ComponentRef<typeof View>, IGridItemProps>(function GridItem(
  { className, _extra, ...props },
  ref
) {
  const { calculatedWidth, numColumns, itemsPerRow, flexDirection, gap, columnGap } =
    useContext(GridContext);
  const gridItemClass = _extra?.className;
  const colSpanMap = generateResponsiveColSpans({ gridItemClassName: gridItemClass });
  const colSpanValue = useBreakpointValue(colSpanMap ?? { default: 1 });
  const responsiveColSpan = (typeof colSpanValue === "number" ? colSpanValue : 1) as number;
  const flexBasisValue = useMemo(() => {
    if (!calculatedWidth || !numColumns || responsiveColSpan <= 0) {
      return "auto";
    }
    if (flexDirection?.includes("column")) {
      return "auto";
    }
    // Find which row this item is in
    const rowKey = Object.keys(itemsPerRow).find((key) => {
      const rowNum = parseInt(key, 10);
      return itemsPerRow[rowNum]?.includes(props?.index ?? -1);
    });
    if (!rowKey) {
      return "auto";
    }
    const rowNum = parseInt(rowKey, 10);
    const rowColsCount = itemsPerRow[rowNum]?.length || 1;
    const space = columnGap || gap || 0;
    // Calculate available width accounting for gaps
    const totalGapWidth = space * (rowColsCount - 1);
    const availableWidth = calculatedWidth - totalGapWidth;
    // Calculate the width for this item based on its column span
    const itemWidth = (availableWidth * responsiveColSpan) / numColumns;
    // Return the width directly instead of percentage for better native compatibility
    return Math.max(0, Math.floor(itemWidth));
  }, [
    calculatedWidth,
    responsiveColSpan,
    numColumns,
    columnGap,
    gap,
    flexDirection,
    itemsPerRow,
    props?.index,
  ]);
  return (
    <View
      ref={ref}
      // @ts-expect-error : internal implementation for r-19/react-native-web
      gridItemClass={gridItemClass}
      className={gridItemStyle({
        class: className,
      })}
      {...props}
      style={[
        {
          width: typeof flexBasisValue === "number" ? flexBasisValue : undefined,
          flexBasis: typeof flexBasisValue === "string" ? flexBasisValue : undefined,
          flexShrink: 0,
          flexGrow: 0,
        },
        props.style,
      ]}
    />
  );
});
Grid.displayName = "Grid";
GridItem.displayName = "GridItem";
export { Grid, GridItem };
