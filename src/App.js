import './App.css';
import { Container, Grid, Typography, Card, CardContent, TextField, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, MarkSeries, VerticalGridLines, VerticalRectSeries, XAxis, XYPlot, YAxis } from "react-vis";
import * as math from 'mathjs';
import { useState, useEffect } from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';
import { isInteger } from 'mathjs';


const GraphMethodType = {
  RECTANGLES: {key: 'RECTANGLES', name: 'Rectángulos'},
  MONTECARLO: {key: 'MONTECARLO', name: 'Monte Carlo'}
};

const X_VALUES_COUNT = 50;
const INITIAL_EXPR = 'x';
const INITIAL_A = 2;
const INITIAL_B = 6;
const INITIAL_N = 20;
const INITIAL_GRAPH_METHOD = GraphMethodType.RECTANGLES.key;

const FlexibleXYPlot = makeWidthFlexible(XYPlot);



function App() {

  const [inputExpr, setInputExpr] = useState(INITIAL_EXPR);
  const [inputA, setInputA] = useState(INITIAL_A);
  const [inputB, setInputB] = useState(INITIAL_B);
  const [inputN, setInputN] = useState(INITIAL_N);
  const [inputGraphMethod, setInputGraphMethod] = useState(INITIAL_GRAPH_METHOD);

  const [funct, setFunct] = useState(INITIAL_EXPR);
  const [a, setA] = useState(INITIAL_A);
  const [b, setB] = useState(INITIAL_B);
  const [n, setN] = useState(INITIAL_N);
  const [graphMethod, setGraphMethod] = useState(INITIAL_GRAPH_METHOD);

  const [compiledExpr, setCompiledExpr] = useState('');
  const [texExpr, setTexExpr] = useState('');
  const [chartData, setChartData] = useState([])
  const [compiledRectangles, setCompiledRectangles] = useState({});
  const [aproximationResult, setAproximationResult] = useState('');

  useEffect(() => {
    console.log("before validations useFffect");
    console.log(inputExpr);
    console.log(a);
    console.log(b);
    console.log(n);
    console.log(inputGraphMethod);
    try {
      const testCompile = math.compile(inputExpr).evaluate({x: inputA});
      if (typeof testCompile !== 'number') return;
    } catch (error) {
      return;
    }

    if (inputA > inputB) return;
    if (inputN <= 0) return;

    setFunct(inputExpr);
    setA(a);
    setB(b);
    setN(n);
    setGraphMethod(inputGraphMethod);

    console.log("useEffect ok");
    console.log(inputExpr);
    console.log(a);
    console.log(b);
    console.log(n);
    console.log(inputGraphMethod);

    compileOperation();
  }, [inputExpr, inputA, inputB, inputN, inputGraphMethod]);
/*
  function onChangeFunctionHandler(stringExpr) {
    try {
      setInputExpr(stringExpr);
      if (stringExpr == '') {
        throw new Error("empty_expression_input");
      }
      math.parse(stringExpr);
      setFunct(stringExpr);
      compileOperation();
    } catch (error) {
      console.log(error);
    }
  }

  function onChangeInputA(a) {
      if (a > b) {
        console.log("Error: a debe ser menor que b");
      } else {
        setA(a);
        compileOperation();
      }
  }

  function onChangeInputB(b) {
    if (a > b) {
      console.log("Error: a debe ser menor que b");
    } else {
      setB(b);
      compileOperation();
    }
  }

  function onChangeInputN(n) {
    if (n <= 0) {
      console.log("Error: a debe ser mayor a 0");
    } else {
      setN(n);
      compileOperation();
    }
  }

  function onChangeInputMethod(methodKey) {
    setGraphMethod(methodKey); 
    compileOperation();
  }
  */

  
  function onChangeFunctionHandler(stringExpr) {
    setInputExpr(stringExpr);
  }

  function onChangeInputA(a) {
    setInputA(a);
  }

  function onChangeInputB(b) {
    setInputB(b);
  }

  function onChangeInputN(n) {
    setInputN(n);
  }

  function onChangeInputMethod(methodKey) {
    setInputGraphMethod(methodKey); 
  }


  function compileOperation() {
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
    return newData;
  }

  function calculateRectangles(mathFunction, a, b, n) {
    const rectangleWidth = (b-a)/n;
    const compiledFunction = math.parse(mathFunction).compile();
  
    var area = 0;
    var rectangles_points = []
  
    math.range(a, b, rectangleWidth, false).forEach(x0 => {
      const evaluation_x = x0 + rectangleWidth / 2;
      const y = compiledFunction.evaluate({x: evaluation_x});
      const graph_points = {
        x0: x0, // Rectangle left side coordinate
        x: x0 + rectangleWidth, // Rectangle right side coordinate
        y: y, // Rectangle   (Y value)
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
            Integración por aproximación
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
                    data={chartData} />
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
            <TextField id="function" label="Función" variant="outlined" value={inputExpr} onChange={(e) => onChangeFunctionHandler(e.target.value)} />
            <TextField id="width-a" type="number" label="a" variant="outlined" value={inputA} onChange={(e) => onChangeInputA(e.target.value)} />
            <TextField id="width-b" type="number" label="b" variant="outlined" value={inputB} onChange={(e) => onChangeInputB(e.target.value)} />
            <TextField id="n" type="number" label="n" variant="outlined" value={inputN} onChange={(e) => onChangeInputN(e.target.value)} />
            <FormControl fullWidth>
              <InputLabel id="graph-method">Método</InputLabel>
              <Select
                labelId="graph-method"
                id="graph-method-select"
                value={inputGraphMethod}
                label="Método"
                onChange={(e) => {onChangeInputMethod(e.target.value)}}>
                <MenuItem value={GraphMethodType.RECTANGLES.key}>{GraphMethodType.RECTANGLES.name}</MenuItem>
                <MenuItem value={GraphMethodType.MONTECARLO.key}>{GraphMethodType.MONTECARLO.name}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <MathJaxContext>          
              <MathJax>{`$$\\int_{${a}}^{${b}} ${texExpr} \\, dx \\approx ${math.round(aproximationResult, 6)} $$`}</MathJax>
            </MathJaxContext>
          </Grid>
        </Grid>
      </Grid>
    </Container >
  );
}



export default App;
