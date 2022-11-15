import './App.css';

import { Alert, Box, Container, Grid, Typography, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Button, GlobalStyles } from '@mui/material';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, MarkSeries, VerticalGridLines, VerticalRectSeries, XAxis, XYPlot, YAxis } from "react-vis";
import * as math from 'mathjs';
import { useState, useEffect } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { isInteger } from 'mathjs';


const GraphMethodType = {
  RECTANGLES: { key: 'RECTANGLES', name: 'Rectángulos' },
  MONTECARLO: { key: 'MONTECARLO', name: 'Monte Carlo' }
};

const X_VALUES_COUNT = 50;
const INITIAL_EXPR = 'x';
const INITIAL_A = 0;
const INITIAL_B = 6;
const INITIAL_N = 20;
const INITIAL_GRAPH_METHOD = GraphMethodType.RECTANGLES.key;
const FAIL_COLOR = '#FF6962';
const SUCCESS_COLOR = '#77DD76';

const FlexibleXYPlot = makeWidthFlexible(XYPlot);



function App() {

  const [inputExpr, setInputExpr] = useState(INITIAL_EXPR);
  const [inputA, setInputA] = useState(INITIAL_A);
  const [inputB, setInputB] = useState(INITIAL_B);
  const [inputN, setInputN] = useState(INITIAL_N);
  const [inputGraphMethod, setInputGraphMethod] = useState(INITIAL_GRAPH_METHOD);

  const [compiledExpr, setCompiledExpr] = useState('');
  const [texExpr, setTexExpr] = useState('');
  const [chartData, setChartData] = useState([])
  const [compiledRectangles, setCompiledRectangles] = useState({});
  const [aproximationResult, setAproximationResult] = useState('');
  const [compiledPoints, setCompiledPoints] = useState([]);
  
  const [errorA, setErrorA] = useState(false);
  const [errorMessageA, setErrorMessageA] = useState('');
  const [errorB, setErrorB] = useState(false);
  const [errorMessageB, setErrorMessageB] = useState('');
  const [errorN, setErrorN] = useState(false);
  const [errorMessageN, setErrorMessageN] = useState('');

  useEffect(() => {

    setErrorA(false);
    setErrorMessageA('');
    setErrorB(false);
    setErrorMessageB('');
    setErrorN(false);
    setErrorMessageN('');

    if (inputA === '') {
      setErrorA(true);
      setErrorMessageA('No puede estar vacío');
      return;
    }
    if (inputB === '') {
      setErrorB(true);
      setErrorMessageB('No puede estar vacío');
      return;
    }
    if (inputN === '') {
      setErrorN(true);
      setErrorMessageN('No puede estar vacío');
      return;
    }
    if (inputA >= inputB) {
      setErrorA(true);
      setErrorMessageA('Debe ser menor a "b"');
      return;
    }
    console.log("a > b validation ok");

    if (inputN <= 0) {
      setErrorN(true);
      setErrorMessageN('Debe ser mayor a 0');
      return;
    }
    console.log("n <= 0 validation ok");

    console.log("mock: " + math.compile('x').evaluate({ x: 1 }));

    try {
      const testCompileA = math.compile(inputExpr).evaluate({ x: Number(inputA) });
      const testCompileB = math.compile(inputExpr).evaluate({ x: Number(inputB) });

      if (typeof testCompileA !== 'number' || typeof testCompileB !== 'number') return;
    } catch (error) {
      return;
    }
    console.log("compile expression validation ok");

    console.log("All validations OK");

    compileOperation(inputExpr, inputA, inputB, inputN, inputGraphMethod);
  }, [inputExpr, inputA, inputB, inputN, inputGraphMethod]);

  function onChangeFunctionHandler(stringExpr) {
    setInputExpr(stringExpr);
    console.log(typeof stringExpr);
  }

  function onChangeInputA(a) {
    setInputA(a);
    console.log(typeof a);
  }

  function onChangeInputB(b) {
    setInputB(b);
    console.log(typeof b);
  }

  function onChangeInputN(n) {
    setInputN(n);
    console.log(typeof n);
  }

  function onChangeInputMethod(methodKey) {
    setInputGraphMethod(methodKey);
  }

  function compileOperation(funct, a, b, n, graphMethod) {
    if (graphMethod == GraphMethodType.RECTANGLES.key) {
      console.log("Rectangles method");
      const newParsedExpr = math.parse(funct);
      const newCompiledExpr = newParsedExpr.compile();
      const newTexExpr = newParsedExpr.toTex();
      setCompiledExpr(newCompiledExpr);
      setTexExpr(newTexExpr);

      setChartData(generateChartData(funct, a, b));

      const compiledRectangles = calculateRectangles(funct, a, b, n);
      setCompiledRectangles(compiledRectangles);
      setAproximationResult(compiledRectangles['area']);
      console.log("rectangle total area:" + compiledRectangles['area'])

    } else if (graphMethod == GraphMethodType.MONTECARLO.key) {
      console.log("Montecarlo method");
      const newChartData = generateChartData(funct, a, b);
      const compiledPoints = calculateMontecarlo(funct, a, b, n, newChartData);
      setChartData(newChartData);
      setCompiledPoints(compiledPoints['points']);
      setAproximationResult(compiledPoints['value']);
    }
  }

  function generateChartData(f, a, b) {
    const newExpression = math.parse(f);
    const compiledExpression = newExpression.compile();
    const newX = math.range(a, b, (b - a) / X_VALUES_COUNT, true).toArray();
    const newData = newX.map(x => ({ x: x, y: compiledExpression.evaluate({ x }) }));
    console.log(newData)
    return newData;
  }

  function calculateRectangles(mathFunction, a, b, n) {
    const rectangleWidth = (b - a) / n;
    const compiledFunction = math.parse(mathFunction).compile();

    var area = 0;
    var rectangles_points = []

    math.range(a, b, rectangleWidth, false).forEach(x0 => {
      
      const evaluation_x = x0 + rectangleWidth / 2;
      const y = compiledFunction.evaluate({ x: evaluation_x });
      const graph_points = {
        x0: x0, // Rectangle left side coordinate
        x: x0 + rectangleWidth, // Rectangle right side coordinate
        y: y, // Rectangle   (Y value)
      };
      area += rectangleWidth * Math.abs(y);
      rectangles_points.push(graph_points);
    });

    return { 'rectangles_points': rectangles_points, 'area': area }
  }

  function calculateMontecarlo(funct, a, b, n, data) {
    const compiledExpr = math.compile(funct);
    const randomXValues = math.random([1, n], a, b)[0];
    const maxY = data.length === 0 ? 0 : math.max(data.map(p => p.y));
    const randomPoints = randomXValues.map(x => {
      const yValue = compiledExpr.evaluate({ x });
      const randomY = math.random(0, maxY);
      const successPoint = randomY < yValue;
      return {
        x,
        y: randomY,
        color: successPoint ? SUCCESS_COLOR : FAIL_COLOR,
        isSuccess: successPoint
      }
    });

    const maxYRandomPoints = randomPoints.length === 0 ? 0 : math.max(randomPoints.map(p => p.y));
    const successPointsCount = randomPoints.reduce((a, v) => (v.isSuccess ? a + 1 : a), 0);
    const montecarloValue = math.round((successPointsCount / randomPoints.length) * (b - a) * maxYRandomPoints, 2);

    return { points: randomPoints, value: montecarloValue };
  }

  return (
    <Container maxWidth={false} class="tituloContenedor">
      <GlobalStyles
        styles={{
          body: { backgroundColor: "#f0cf89" }
        }}
      />
      <Grid container spacing={3}>
        <Grid item xs={12} class="titulo">
          <Typography style={{ textAlign: 'center', color: 'black' }} variant='h4'>
            Integración por aproximación
          </Typography>
        </Grid>
        <div></div>
        <Grid item xs={12} class="contenedor">
          <Grid item xs={7}>
            <Card>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <FlexibleXYPlot height={600}>
                  <VerticalGridLines />
                  <HorizontalGridLines />
                  <XAxis tickSize={4}/>
                  <YAxis tickSize={4}/>
                  <LineSeries
                    color="green"
                    style={{ fill: 'none' }}
                    data={chartData} />
                  {inputGraphMethod == GraphMethodType.RECTANGLES.key ?
                    <VerticalRectSeries
                      colortype='literal'
                      opacity={0.45}
                      stroke={'#3e4444'}
                      data={compiledRectangles['rectangles_points']}
                    />
                    :
                    <MarkSeries
                      colorType='literal'
                      stroke={'black'}
                      data={compiledPoints}
                      animation={"noWobble"}
                    />
                  }
                </FlexibleXYPlot>
              </CardContent>
            </Card>
          </Grid>
          <Box sx={{
            display: 'flex',
            alignItems: 'flex-start',
            flexDirection: 'column',
            justifyContent: 'space-evenly',
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 1,
            p: 3,
            width: 300
          }}>
            <TextField 
              id="function" 
              label="Función" 
              variant="outlined"
              fullWidth
              value={inputExpr} 
              onChange={(e) => onChangeFunctionHandler(e.target.value)} 
            />
            <TextField 
              id="width-a" 
              type="number" 
              label="a" 
              variant="outlined" 
              fullWidth
              value={inputA} 
              onChange={(e) => onChangeInputA(e.target.value)} 
              error={errorA} 
              helperText={errorMessageA} 
            />
            <TextField 
              id="width-b" 
              type="number" 
              label="b" 
              variant="outlined" 
              fullWidth
              value={inputB} 
              onChange={(e) => onChangeInputB(e.target.value)}
              error={errorB} 
              helperText={errorMessageB}  
            />
            <TextField 
              id="n"
              type="number" 
              label="n" 
              variant="outlined"
              fullWidth
              value={inputN} 
              onChange={(e) => onChangeInputN(e.target.value)}
              error={errorN} 
              helperText={errorMessageN}  
            />
            <FormControl fullWidth>
              <InputLabel id="graph-method">Método</InputLabel>
              <Select
                labelId="graph-method"
                id="graph-method-select"
                value={inputGraphMethod}
                fullWidth
                label="Método"
                onChange={(e) => { onChangeInputMethod(e.target.value) }}>
                <MenuItem value={GraphMethodType.RECTANGLES.key}>{GraphMethodType.RECTANGLES.name}</MenuItem>
                <MenuItem value={GraphMethodType.MONTECARLO.key}>{GraphMethodType.MONTECARLO.name}</MenuItem>
              </Select>
            </FormControl>
            {inputGraphMethod == GraphMethodType.MONTECARLO.key ?
              <Button variant="contained" fullWidth onClick={() => compileOperation(inputExpr, inputA, inputB, inputN, inputGraphMethod)}>Regenerar puntos</Button>
              :
              <></>}
            <MathJaxContext>
              <MathJax>{`$$\\int_{${inputA}}^{${inputB}} ${texExpr} \\, dx \\approx ${math.round(aproximationResult, 6)} $$`}</MathJax>
            </MathJaxContext>
          </Box>
        </Grid>
      </Grid>
    </Container >
  );
}



export default App;
