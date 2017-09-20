import React from 'react';
import { connect } from 'react-redux';
import { Card, Row, Col, Input, Icon } from 'react-materialize';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import ChartComponent from '../chartComponents';
import BoardChart from '../chartWrappers/BoardChart';
import BoardPinModal from '../components/BoardPinModal';
import firebase from '../firebase';
import embed from '../firebase/embed';

class Board extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      renders: 0,
    }
    this.chart = BoardChart(props.boardName, props.favourite, embed, props.deleteChart, props.moveColumn, BoardPinModal);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ renders: this.state.renders + 1 });
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  render() {
    console.log('render', this.state.renders);
    return (
      <Row>
        <Row>
          <h1 style={{ textAlign: 'center' }}>{this.props.boardName}</h1>
        </Row>
        {this.props.columns.map((column, index) =>
          (<Col m={4}>
            <Card
              horizontal
              title={<div>{column.name} <div><Icon right>edit</Icon></div></div>}
            >
              <Row>
                <Input label="Enter a ColumnName" s={12} onChange={event => this.props.nameColumn(this.props.boardName, index, event.target.value)} />
                {column.charts
                  .map(ChartComponent(this.chart, this.state.renders < 1))}
              </Row>
            </Card>
          </Col>),
        )}
      </Row>
    );
  }
}

const mapStateToProps = (state, props) => {
  const boardName = props.match.params.boardName;
  const boardState = state.boards[boardName];
  return {
    boardName,
    columns: boardState.columnNames.map((name, index) =>
      ({
        name,
        charts: Object.keys(boardState.charts || {})
          .map(key => ({ ...boardState.charts[key], parentKey: key }))
          .filter(chart => chart.colIndex === index)
          .map(chart => ({ ...state.charts[chart.id], parentKey: chart.parentKey, colIndex: chart.colIndex, id: chart.id })),
      }),
    ),
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch, props) => {
  const uid = firebase.auth().currentUser.uid;
  return {
    favourite: (id, val) => firebase.database().ref(`/charts/${uid}/${id}/favourited`).set(val),
    deleteChart: (parentKey, boardName) => firebase.database().ref(`/boards/${uid}/${boardName}/charts/${parentKey}`).remove(),
    moveColumn: (parentKey, boardName, toColumn) => firebase.database().ref(`/boards/${uid}/${boardName}/charts/${parentKey}/colIndex`).set(toColumn),
    nameColumn: debounce(
      (boardName, index, newName) => firebase.database().ref(`/boards/${uid}/${boardName}/columnNames/${index}`).set(newName),
      400),
    pinToBoard: (id, boardName) =>
      props.boardNames.includes(boardName)
      && !props.boardContents[boardName].includes(id)
      && dispatch({ type: 'BOARD_CHART_ADD', id }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Board);

