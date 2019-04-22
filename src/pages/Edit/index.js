import React, { Component } from 'react';
import {
  Alert, View, TouchableOpacity, Platform, Dimensions, StatusBar,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Creators as ItemsActions } from '~/store/ducks/items';
import { Creators as BasketActions } from '~/store/ducks/basket';
import { Creators as CombosActions } from '~/store/ducks/combos';

import { navigate } from '~/services/navigation';

import Modal from 'react-native-modal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

import { colors } from '~/styles';
import {
  Container,
  Header,
  Title,
  Burguer,
  Ingredient,
  IngName,
  IngPrice,
  Action,
  ActionText,
  Separator,
  Option,
  OptionText,
  Promotion,
  Finish,
  FinishText,
} from '~/styles/general';

import { AddIng } from './styles';

class Edit extends Component {
  state = { modalVisible: false }

  componentDidMount() {
  }

  toggleModal = () => {
    const { modalVisible } = this.state;

    this.setState({ modalVisible: !modalVisible });
  }

  render() {
    const {
      item, addOne, remOne, remove, request,
    } = this.props;
    const { modalVisible } = this.state;

    const more = item.ingredients.filter(ing => ing.amount < 1);
    const contain = item.ingredients.filter(ing => ing.amount >= 1);

    // const isLight = !!(((contain.filter(ing => ing.name === 'Alface')
    //   .length >= 1)
    //   && (contain.filter(ing => ing.name === 'Bacon').length < 1)));
    // const muchMeat = (contain.filter(ing => ing.name === 'Hambúrguer de carne').length >= 3);
    // const muchCheese = (contain.filter(ing => ing.name === 'Queijo').length >= 3);


    let total = 0.00;

    if ((contain.length >= 1) && (item.promotions.isLight === true)) {
      total = contain.reduce((previousValue, currentValue) => (
        { price: (previousValue.price) + (currentValue.price) }
      ));

      total.price *= 0.9;
    } else if (contain.length >= 1) {
      total = contain.reduce((previousValue, currentValue) => (
        { price: (previousValue.price) + (currentValue.price) }
      ));
    }

    const deviceWidth = Dimensions.get('window').width;
    const deviceHeight = Platform.OS === 'ios'
      ? Dimensions.get('window').height
      : require('react-native-extra-dimensions-android')
        .get('REAL_WINDOW_HEIGHT');

    return (
      <Container>
        <StatusBar
          backgroundColor={colors.background}
          barStyle="light-content"
        />
        <Header>
          <Title>Edição de ingredientes</Title>
        </Header>

        <Burguer.Container>
          <Burguer.Header>
            <Burguer.Name>{item.name}</Burguer.Name>
          </Burguer.Header>

          {(contain.length >= 1) && contain.map(ing => (
            <Ingredient key={ing.id}>
              <IngName>
                {ing.name}
              </IngName>

              <TouchableOpacity
                onPress={(ing.amount > 1)
                  ? () => { remOne(ing); }
                  : () => {
                    Alert.alert(
                      'Hey!',
                      'Você deseja mesmo remover este ingrediente?',
                      [
                        { text: 'Sim!', onPress: () => remOne(ing) },
                        { text: 'Não' },
                      ],
                      { cancelable: true },
                    );
                  }
              }
              >
                <FontAwesome name="minus" size={15} color={colors.white} />
              </TouchableOpacity>

              <IngPrice>
                {ing.amount}
              </IngPrice>

              <TouchableOpacity
                onPress={() => { addOne(ing); }}
              >
                <FontAwesome name="plus" size={15} color={colors.white} />
              </TouchableOpacity>

              <IngPrice>
                R$
                {parseFloat(ing.price).toFixed(2).replace('.', ',').trim()}
              </IngPrice>
            </Ingredient>
          ))}

          {(more.length >= 1) && (
          <Action
            onPress={() => this.toggleModal()}
          >
            <AddIng>Adicionar novo ingrediente</AddIng>
          </Action>
          )}

          {total !== null && (
            <Burguer.Footer style={{ justifyContent: 'space-between' }}>


              {(item.promotions.isLight) && (
              <Promotion style={{ color: colors.green }}>
                Light!
              </Promotion>
              )}

              {(item.promotions.muchMeat) && (
              <Promotion style={{ color: colors.red }}>
                Muita carne!
              </Promotion>
              )}

              {(item.promotions.muchCheese) && (
              <Promotion style={{ color: colors.yellow }}>
                Muito queijo!
              </Promotion>
              )}

              <View />

              <IngPrice>
                Total: R$
                {' '}
                {parseFloat(total.price || total).toFixed(2).replace('.', ',').trim()}
              </IngPrice>
            </Burguer.Footer>
          )}
        </Burguer.Container>

        <Separator />

        <Finish
          onPress={(contain.length >= 1)
            ? () => {
              remove(item);
              navigate('Basket');
              request({ item });
            }
            : () => {
              Alert.alert(
                'Opa!',
                'Você precisa de pelo menos 1 ingrediente em seu lanche!',
              );
            }
          }
        >
          <FinishText>FINALIZAR EDIÇÃO</FinishText>
        </Finish>

        <Modal
          isVisible={modalVisible}
          deviceWidth={deviceWidth}
          deviceHeight={deviceHeight}
        >
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background,
            }}
          >
            {more.map(ing => (
              <React.Fragment
                key={ing.id}
              >
                <Option
                  onPress={() => {
                    addOne(ing);
                    this.toggleModal();
                  }}
                >
                  <OptionText>{ing.name}</OptionText>
                </Option>
                <Separator />
              </React.Fragment>
            ))}


            <Action
              onPress={() => this.toggleModal()}
            >
              <ActionText>Cancelar</ActionText>
            </Action>
          </View>
        </Modal>
      </Container>
    );
  }
}

Edit.propTypes = {
  item: PropTypes.objectOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.array,
    PropTypes.object,
  ])),
  addOne: PropTypes.func,
  remOne: PropTypes.func,
  remove: PropTypes.func,
  request: PropTypes.func,
};

Edit.defaultProps = {
  item: {},
  addOne: () => {},
  remOne: () => {},
  remove: () => {},
  request: () => {},
};

const mapStateToProps = state => ({
  item: state.items.item,
  ingredients: state.ingredients,
});

const mapDispatchToProps = dispatch => bindActionCreators(
  {
    addOne: ItemsActions.addOne,
    remOne: ItemsActions.remOne,
    remove: BasketActions.rem,
    request: CombosActions.addRequest,
  },
  dispatch,
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Edit);
