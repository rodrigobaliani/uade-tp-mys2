import logo from './logo.svg';
import './App.css';
import { Container, Grid, Typography, Card, CardContent, TextField } from '@mui/material';
import { HorizontalGridLines, LineSeries, makeWidthFlexible, VerticalGridLines, XAxis, XYPlot, YAxis } from "react-vis";
import * as math from 'mathjs';

const X_VALUES_COUNT = 50;
const FlexibleXYPlot = makeWidthFlexible(XYPlot);

function App() {
  return (
    <Container>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography style={{ textAlign: 'center', color: 'black' }} variant='h4'>
            Integración
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
                    data={[
                      { x: 1, y: 10 },
                      { x: 2, y: 5 },
                      { x: 3, y: 1 }
                    ]} />
                    <LineSeries
                    data={[
                      {x: 1, y: 12},
                      {x: 2, y: 21},
                      {x: 3, y: 2}
                    ]}/>
                </FlexibleXYPlot>
              </CardContent>
              </Card>
          </Grid>
          <Grid item xs={4}>
            <TextField id="function" label="Función" variant="outlined" />
            <TextField id="width-a" label="a" variant="outlined" />
            <TextField id="width-b" label="b" variant="outlined" />
            <TextField id="n" label="n" variant="outlined" />
          </Grid>
        </Grid>
      </Grid>
    </Container >
  );
}


export default App;
