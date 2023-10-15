import { ViewStyle } from "react-native"
import Pen from "./tools/pen"
import Point from "./tools/point"

export interface WhiteBoardProps {
    strokeColor?: string,
    strokeWidth?: number,
    rewind?: (f: () => void) => void,
    clear?: (f: () => void) => void,
    changeStroke?: (f: (stroke: number) => void) => void,
    changeColor?: (f: (color: string) => void) => void,
    enabled?: boolean,
    strokes: Stroke[],
    onChangeStrokes: (strokes: Stroke[]) => void,
    containerStyle?: ViewStyle,
    children?: React.ReactNode
}

export interface WhiteBoardState {
    previousStrokes: Stroke[],
    height: number,
    width: number,
    px: number,
    py: number,
    fx?: number,
    fy?: number,
    tracker: number,
    currentPoints: Stroke,
    pen: Pen,
    strokeWidth: number,
    strokeColor: string
}

export interface DrawBox {
    width: number,
    height: number
}

export interface Stroke {
    color: string,
    width: number,
    box: DrawBox,
    points: Point[]
}

export interface ClientEvents {

}