import './App.css';
import { Container, Grid, Typography, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, MarkSeries, VerticalGridLines, VerticalRectSeries, XAxis, XYPlot, YAxis } from "react-vis";
import * as math from 'mathjs';
import { useState } from 'react';

const X_VALUES_COUNT = 50;

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

function App() {

  const [funct, setFunct] = useState('x^2+ 2x +4');
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [n, setN] = useState('20');
  const [graphData, setGraphData] = useState({});
  const [graphMethod, setGraphMethod] = useState('')

  function generateChartData(f, a, b) {
    const newExpression = math.parse(f);
    const compiledExpression = newExpression.compile();
    const newX = math.range(a, b, (b-a)/X_VALUES_COUNT, true).toArray();
    const newData = newX.map(x => ({x: x, y: compiledExpression.evaluate({x})}));
    console.log(newData)
    return {
      tex: newExpression.toTex(),
      data: newData,
    };
  }

  function calculateRectangles(mathFunction, a, b, n) {
    const rectangleWidth = (b-a)/n;
    const compiledFunction = math.compile(mathFunction);
  
    var area = 0;
    var rectangles_points = []
  
    math.range(a, b, rectangleWidth, false).forEach(x0 => {
      const evaluation_x = x0 + rectangleWidth / 2;
      const y = compiledFunction.evaluate({x: evaluation_x});
      const graph_points = {
        x1: x0, // Rectangle left side coordinate
        x2: x0 + rectangleWidth, // Rectangle right side coordinate
        y: y, // Rectangle height (Y value)
      };
      area += rectangleWidth * y;
      rectangles_points.push(graph_points);
    });
  
    return {'rectangles_points': rectangles_points, 'totalArea': area}
  }

  return (
    <Container maxWidth={false}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography style={{ textAlign: 'center', color: 'black' }} variant='h4'>
            Integración {funct}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={8}>
            <Card>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <FlexibleXYPlot height={600}>
                  <VerticalGridLines />
                  <HorizontalGridLines />
                  <XAxis />
                  <YAxis />
                  <LineSeries
                    color="red"
                    fill="false"
                    data={generateChartData(funct, a, b).data} />
                    {graphMethod == 'rectangle' ? 
                      <MarkSeries/>
                    :
                      <VerticalRectSeries/>}
                </FlexibleXYPlot>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <TextField id="function" label="Función" variant="outlined" value={funct} onChange={(e) => setFunct(e.target.value)} />
            <TextField id="width-a" label="a" variant="outlined" value={a} oncChange={(e) => setA(e.target.value)} />
            <TextField id="width-b" label="b" variant="outlined" value={b} onChange={(e) => setB(e.target.value)} />
            <TextField id="n" label="n" variant="outlined" value={n} onChange={(e) => setN(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="graph-method">Método</InputLabel>
              <Select
                labelId="graph-method"
                id="graph-method-select"
                value={graphMethod}
                label="Método"
                onChange={(e) => setGraphMethod(e.target.value)}
              >
                <MenuItem value={'rectangle'}>Rectángulos</MenuItem>
                <MenuItem value={'montecarlo'}>Montecarlo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Grid>
    </Container >
  );
}



export default App;
