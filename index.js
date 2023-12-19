import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import PropTypes from 'deprecated-react-native-prop-types';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  terminal: {
    flex: 1,
  },
  loading: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222222CC',
  },
});

export default class Terminal extends React.Component {
  static propTypes = {
    commandMapping: PropTypes.shape({}).isRequired,
    onReady: PropTypes.func,
    style: PropTypes.shape({}),
    fontSize: PropTypes.number,
  }
  static defaultProps = {
    commandMapping: {
      print: {
        optDef: {},
        function: (Terminal, opts) => {
          return Terminal.OutputFactory.makeTextOutput(
            opts
              .join(' '),
          );
        },
      },
      alert: {
        function: (Terminal, opts) => {
          Alert.alert(
            opts
              .join(' '),
          );
        },
        optDef: {},
      },
    },
    onReady: (Terminal) => {
      Terminal.OutputFactory.makeTextOutput(
        '⚛️  Welcome to React Native!',
      );
      Terminal.OutputFactory.makeTextOutput('');
      Terminal.OutputFactory.makeTextOutput(
        '✍️ To get started, edit App.js',
      );
      Terminal.OutputFactory.makeTextOutput('');
      Terminal.OutputFactory.makeTextOutput(
        Platform.OS === 'ios' ? 'Press Cmd+R to reload, Cmd+D or shake for dev menu' : 'Shake or press menu button for dev menu',
      );
      Terminal.OutputFactory.makeTextOutput('');
//      Terminal.OutputFactory.makeErrorOutput({
//        source: 'hello',
//        type: 'world',
//      });
    },
    style: styles.container,
    fontSize: 14,
  }
  constructor(nextProps) {
    super(nextProps);
    this.__onMessage = this.__onMessage.bind(this);
    this.__makeTextOutput = this.__makeTextOutput.bind(this);
    this.state = {
      ready: false,
      TerminalInterface: {
        OutputFactory: {
          makeTextOutput: str => this.__makeTextOutput(str),
          makeErrorOutput: err => this.__makeErrorOutput(err),
        },
      },
    };
  }
  // TODO: de-promisify
  __handleAction(type, data) {
    const {
      commandMapping,
      onReady,
    } = this.props;
    const {
      // XXX: This naming convention exagerrates the point that
      //      we're making a bridge between the native environment
      //      and the WebView.
      TerminalInterface: Terminal,
      ready,
    } = this.state;
    if (type === 'ACTION_TYPE_READY') {
      if (!ready) {
        return new Promise(resolve => this.setState(
          {
            ready: true,
          },
          resolve,
        ))
          .then(() => onReady(Terminal));
      }
      return Promise.reject(
        new Error(
          'Terminal is already initialized!',
        ),
      );
    }
    if (!ready) {
      return Promise.reject(
        new Error(
          `Received an action before the Terminal was initialized!`,
        ),
      );
    } else if (type === 'ACTION_TYPE_COMMAND') {
      const {
        key,
        opts,
      } = data;
      const {
        function: nativeFunction,
      } = (commandMapping[key] || {});
      if (nativeFunction) {
        return Promise.resolve(
          nativeFunction(
            Terminal,
            opts,
          ),
        );
      }
      return Promise.reject(
        new Error(
          `Failed to resolve native handler for "${key}"!`,
        ),
      );
    }
    return Promise.reject(
      new Error(
        `Unrecognized action "${type}"!`,
      ),
    );
  }
  __makeTextOutput(str = '') {
    return this.refs.terminal.injectJavaScript(
      `window.addOutput("${str}");`,
    );
  }
  __makeErrorOutput(err) {
    return this.refs.terminal.injectJavaScript(
      `window.addErrorOutput(${JSON.stringify(err)});`,
    );
  }
  __onMessage(e) {
    const {
      type,
      data,
    } = JSON.parse(e.nativeEvent.data);
    if (!type) {
      return Promise.reject(
        new Error(
          `Received an invalid action. Exepcted truthy type, received "${type}".`,
        ),
      );
    }
    return this.__handleAction(type, data);
  }
  __serializeCommandMapping(commandMapping = {}) {
    return Object.entries(commandMapping)
      .reduce(
        (obj, [key, { optDef }]) => {
          return {
            ...obj,
            [key]: {
              optDef,
            },
          };
        },
        {},
      );
  }
  render() {
    const {
      style,
      commandMapping,
      fontSize,
    } = this.props;
    const {
      ready,
    } = this.state;
    return (
      <View
        style={style || styles.container}
      >
        <WebView
          ref="terminal"
          style={styles.container}
          source={{
            html: require('./demo-rn/terminal.min.js')(
              // TODO: requires serialiation functions
              this.__serializeCommandMapping(
                commandMapping,
              ),
              `${fontSize}pt`,
            ),
          }}
          originWhitelist={['*']}
          onMessage={this.__onMessage}
        />
        {(!ready) && (
          <View
            style={styles.loading}
          >
            <ActivityIndicator
            />
          </View>
        )}
      </View>
    );
  }
}
