import React from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-materialize';
import firebase from '../firebase';
import ChartComponent from '../chartComponents';
import FavouritesChart from '../chartWrappers/FavouritesChart';
import BoardPinModal from '../components/BoardPinModal';
import embed from '../firebase/embed';

const Favourites = (props) => {
  const setFavouriteStatus = (id, val) => firebase.database().ref(`/charts/${props.user.uid}/${id}/favourited`).set(val);
  return (
    <Row>
      {props.favourites.map(ChartComponent(FavouritesChart(setFavouriteStatus, embed, BoardPinModal)))}
    </Row>
  );
};

const mapStateToProps = state => ({
  favourites: Object.keys(state.charts).filter(key => state.charts[key].favourited).map(key => ({ ...state.charts[key], id: key })),
  boardNames: Object.keys(state.boards),
  user: state.user,
  boardContents: state.boards,
});

const mapDispatchToProps = (dispatch, props) => ({
  unfavourite: id => dispatch({ type: 'FAVOURITES_DELETE', id }),
  pinToBoard: (id, boardName) =>
    props.boardNames.includes(boardName)
    && !props.boardContents[boardName].includes(id)
    && dispatch({ type: 'BOARD_CHART_ADD', id }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Favourites);
