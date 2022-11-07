import './App.css';
import { Container, Grid, Typography, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, MarkSeries, VerticalGridLines, VerticalRectSeries, XAxis, XYPlot, YAxis } from "react-vis";
import * as math from 'mathjs';
import { useState } from 'react';

const X_VALUES_COUNT = 50;

const FlexibleXYPlot = makeWidthFlexible(XYPlot);

const GraphMethodType = {
  RECTANGLES: {key: 'RECTANGLES', name: 'Rectángulos'},
  MONTECARLO: {key: 'MONTECARLO', name: 'Monte Carlo'}
};

function App() {

  const [funct, setFunct] = useState('x');
  const [a, setA] = useState('2');
  const [b, setB] = useState('4');
  const [n, setN] = useState('20');
  const [graphData, setGraphData] = useState({});
  const [graphMethod, setGraphMethod] = useState(GraphMethodType.RECTANGLES.key)
  const [compiledRectangles, setCompiledRectangles] = useState({});
  const [aproximationResult, setAproximationResult] = useState('')

  function compileOperation(graphMethod) {
    if (graphMethod == GraphMethodType.RECTANGLES.key) {
      console.log("Rectangles method");
      const compiledRectangles = calculateRectangles(funct, a, b, n);
      setCompiledRectangles(compiledRectangles);
      setAproximationResult(compiledRectangles['area']);
    } else if (graphMethod == GraphMethodType.MONTECARLO.key) {
      console.log("Montecarlo method");
    }
  }

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
        x0: x0, // Rectangle left side coordinate
        x: x0 + rectangleWidth, // Rectangle right side coordinate
        y: y, // Rectangle height (Y value)
      };
      area += rectangleWidth * y;
      rectangles_points.push(graph_points);
    });
  
    return {'rectangles_points': rectangles_points, 'area': area}
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
                    color="green"
                    style={{fill: 'none'}}
                    data={generateChartData(funct, a, b).data} />
                    {graphMethod == GraphMethodType.RECTANGLES.key ? 
                      <VerticalRectSeries
                        colortype='literal'
                        opacity={0.45}
                        stroke={'#3e4444'}
                        data={compiledRectangles['rectangles_points']}
                      />
                      :
                      <MarkSeries/>
                    }
                </FlexibleXYPlot>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={4}>
            <TextField id="function" label="Función" variant="outlined" value={funct} onChange={(e) => setFunct(e.target.value)} />
            <TextField id="width-a" label="a" variant="outlined" value={a} onChange={(e) => setA(e.target.value)} />
            <TextField id="width-b" label="b" variant="outlined" value={b} onChange={(e) => setB(e.target.value)} />
            <TextField id="n" label="n" variant="outlined" value={n} onChange={(e) => setN(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="graph-method">Método</InputLabel>
              <Select
                labelId="graph-method"
                id="graph-method-select"
                value={graphMethod}
                label="Método"
                onChange={(e) => {setGraphMethod(e.target.value); compileOperation(e.target.value)}}
              >
                <MenuItem value={GraphMethodType.RECTANGLES.key}>{GraphMethodType.RECTANGLES.name}</MenuItem>
                <MenuItem value={GraphMethodType.MONTECARLO.key}>{GraphMethodType.MONTECARLO.name}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <label>Área({funct}) = {aproximationResult}</label>
          </Grid>
        </Grid>
      </Grid>
    </Container >
  );
}



export default App;
