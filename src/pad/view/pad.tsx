import { Component } from 'react'
import {
  View,
  PanResponder,
  StyleSheet,
  PanResponderInstance,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutChangeEvent
} from 'react-native'
import Svg, { G, Path } from 'react-native-svg';
import Pen from '../tools/pen'
import { ClientEvents, Stroke, WhiteBoardProps, WhiteBoardState } from '../types';
import Point from '../tools/point';
import React = require('react');

const styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
    display: 'flex',
  },
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
})

export default class Whiteboard extends Component<WhiteBoardProps, WhiteBoardState> {

  _panResponder: PanResponderInstance;
  _clientEvents: ClientEvents;
  drawer: View | null = null;

  constructor(props: WhiteBoardProps) {
    super(props);

    this.state = {
      tracker: 0,
      currentPoints: {
        color: props.strokeColor || '#000000',
        width: props.strokeWidth || 4,
        box: { height: 0, width: 0 },
        points: []
      },
      previousStrokes: [],
      pen: new Pen(),
      strokeWidth: props.strokeWidth || 4,
      strokeColor: props.strokeColor || '#000000',
      height: 0,
      width: 0,
      px: 0,
      py: 0
    }

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => true,
      onMoveShouldSetPanResponder: (evt, gs) => true,
      onPanResponderGrant: (evt, gs) => this.onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => this.onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => this.onResponderRelease(evt, gs)
    })
    const rewind = props.rewind || function () { }
    const clear = props.clear || function () { }
    const changeStroke = props.changeStroke || function () { }
    const changeColor = props.changeColor || function () { }


    this._clientEvents = {
      rewind: rewind(this.rewind),
      clear: clear(this.clear),
      changeStroke: changeStroke(this.changeStroke),
      changeColor: changeColor(this.changeColor)
    }

  }

  componentDidUpdate() {
    if (this.props.enabled == false && this.props.strokes !== undefined && this.props.strokes.length !== this.state.previousStrokes.length)
      this.setState({ previousStrokes: this.props.strokes || this.state.previousStrokes })
  }

  rewind = () => {
    if (this.state.currentPoints.points.length > 0 || this.state.previousStrokes.length < 1) return
    let strokes = this.state.previousStrokes
    strokes.pop()

    this.state.pen.rewindStroke()
    const { height, width } = this.state;

    this.setState({
      previousStrokes: [...strokes],
      currentPoints: {
        color: this.state.strokeColor,
        width: this.state.strokeWidth,
        box: { height, width },
        points: []
      },
      tracker: this.state.tracker - 1,
    })

    this._onChangeStrokes([...strokes])
  }

  changeColor = (color: string) => {
    const { currentPoints } = this.state;
    currentPoints.color = color;
    this.setState({ currentPoints, strokeColor: color })
  }

  changeStroke = (stroke: number) => {
    const { currentPoints } = this.state;
    currentPoints.width = stroke;
    this.setState({ currentPoints, strokeWidth: stroke })
  }

  clear = () => {
    const { height, width } = this.state;
    this.setState({
      previousStrokes: [],
      currentPoints: {
        color: this.state.strokeColor,
        width: this.state.strokeWidth,
        box: { height, width },
        points: []
      },
      tracker: 0,
    })
    this.state.pen.clear()
    this._onChangeStrokes([])
  }

  onTouch(evt: GestureResponderEvent, gst: PanResponderGestureState) {
    if (this.props.enabled == false) return;
    var { height, width, px, py } = this.state;

    if (evt.nativeEvent.pageX < px || evt.nativeEvent.pageY < py || evt.nativeEvent.pageX > (width + px) || evt.nativeEvent.pageY > (height + py)) return;


    let xf, yf, timestamp;
    [xf, yf, timestamp] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp]

    let newCurrentPoints = this.state.currentPoints
    newCurrentPoints.points.push(new Point(xf, yf, timestamp))

    this.setState({
      previousStrokes: this.state.previousStrokes,
      currentPoints: newCurrentPoints,
      tracker: this.state.tracker
    })

  }

  onResponderGrant(evt: GestureResponderEvent, gestureState: PanResponderGestureState) {
    this.onTouch(evt, gestureState);
  }

  onResponderMove(evt: GestureResponderEvent, gestureState: PanResponderGestureState) {
    this.onTouch(evt, gestureState);
  }

  onResponderRelease(evt: GestureResponderEvent, gestureState: PanResponderGestureState) {
    let strokes = this.state.previousStrokes
    if (this.state.currentPoints.points.length < 1) return
    var { height, width } = this.state;

    var points = this.state.currentPoints
    points.box = { height, width };

    this.state.pen.addStroke(this.state.currentPoints.points)

    this.setState({
      previousStrokes: [...strokes, points],
      currentPoints: {
        color: this.state.strokeColor,
        width: this.state.strokeWidth,
        box: { height, width },
        points: []
      },
      tracker: this.state.tracker + 1,
    })
    this._onChangeStrokes([...strokes, points])
  }

  _onChangeStrokes = (strokes: Stroke[]) => {
    if (this.props.onChangeStrokes) this.props.onChangeStrokes(strokes)
  }

  onLayout = (e: LayoutChangeEvent) => {
    this.drawer?.measure((fx, fy, width, height, px, py) => {
      const currentPoints = this.state.currentPoints;
      currentPoints.box = { height, width }
      this.setState({ height, width, px, py, fx, fy, currentPoints })
    })
  }

  render() {
    var props = this.props.enabled != false ? this._panResponder.panHandlers : {}
    const { height, width } = this.state;

    return (
      <View
        ref={drawer => this.drawer = drawer}
        onLayout={this.onLayout}
        style={[
          styles.drawContainer,
          this.props.containerStyle,
        ]}>
        <View style={styles.svgContainer} {...props}>
          <Svg style={styles.drawSurface}>
            <G>
              {this.state.previousStrokes.map((e) => {
                return (<Path
                  key={e.points[0].time}
                  d={this.state.pen.pointsToSvg(e, { height, width })}
                  stroke={e.color}
                  strokeWidth={e.width}
                  fill="none"
                />)
              }
              )
              }
              <Path
                key={this.state.tracker}
                d={this.state.pen.pointsToSvg(this.state.currentPoints, { height, width })}
                stroke={this.state.currentPoints.color}
                strokeWidth={this.state.currentPoints.width}
                fill="none"
              />
            </G>
          </Svg>

          {this.props.children}
        </View>
      </View>
    )
  }
}