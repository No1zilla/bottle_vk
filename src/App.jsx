import React, { useEffect, useState, useRef } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  SplitLayout,
  SplitCol,
  View,
  Epic,
  Tabbar,
  TabbarItem,
  ConfigProvider,
} from '@vkontakte/vkui';
import {
  Icon28GameOutline,
  Icon28FavoriteOutline,
  Icon28UserCircleOutline,
} from '@vkontakte/icons';
import Home from './panels/Home.jsx';
import Game from './panels/Game.jsx';
import Results from './panels/Results.jsx';
import Leaderboard from './panels/Leaderboard.jsx';
import Profile from './panels/Profile.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import { useVKUser } from './hooks/useVKUser.js';

const BOT_1 = { id: 'bot_1', name: 'Маша', isBot: true, score: 0, avatar: '🐱' };
const BOT_2 = { id: 'bot_2', name: 'Катя', isBot: true, score: 0, avatar: '🦊' };

function clearGameSession() {
  try {
    sessionStorage.removeItem('bottle_game_spinnerIndex');
    sessionStorage.removeItem('bottle_game_targetIndex');
    sessionStorage.removeItem('bottle_game_task');
    sessionStorage.removeItem('bottle_game_phase');
  } catch {}
}

export default function App() {
  const [story, setStory] = useState('game');
  // Start directly on the gameplay screen
  const [activePanel, setActivePanel] = useState('gameplay');
  const [players, setPlayers] = useState([BOT_1, BOT_2]);
  const [scheme, setScheme] = useState('space_gray');
  const { user } = useVKUser();
  const userAddedRef = useRef(false);

  // Clear stale session state on first load
  useEffect(() => {
    clearGameSession();
  }, []);

  // Add the VK user as first player once loaded (only once)
  useEffect(() => {
    if (!user || userAddedRef.current) return;
    userAddedRef.current = true;
    const myName = `${user.first_name} (я)`.slice(0, 16);
    const me = {
      id: `vk_${user.id}`,
      name: myName,
      photo_100: user.photo_100,
      isMe: true,
      score: 0,
    };
    setPlayers([me, BOT_1, BOT_2]);
  }, [user]);

  useEffect(() => {
    let unsub;
    try {
      unsub = bridge.subscribe(({ detail }) => {
        if (!detail) return;
        if (detail.type === 'VKWebAppUpdateConfig') {
          const s = detail.data?.scheme;
          if (s) setScheme(s);
        }
      });
    } catch (e) {
      // ignore in browser
    }
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  function goToGame() {
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
    clearGameSession();
    // Ensure human player spins first
    const currentPlayers = players.map((p) => ({ ...p, score: 0 }));
    const meIdx = currentPlayers.findIndex((p) => p.isMe);
    if (meIdx >= 0) {
      try { sessionStorage.setItem('bottle_game_spinnerIndex', JSON.stringify(meIdx)); } catch {}
    }
    setActivePanel('gameplay');
  }

  function endGame() {
    setActivePanel('results');
  }

  function playAgain() {
    // Go to home screen to let user optionally change players
    setActivePanel('home');
  }

  const appearance =
    scheme === 'space_gray' || scheme === 'vkcom_dark' || scheme === 'client_dark'
      ? 'dark'
      : 'light';

  return (
    <ConfigProvider appearance={appearance}>
      <SplitLayout>
        <SplitCol>
          <OfflineBanner />
          <Epic
            activeStory={story}
            tabbar={
              <Tabbar>
                <TabbarItem
                  onClick={() => setStory('game')}
                  selected={story === 'game'}
                  text="Игра"
                >
                  <Icon28GameOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setStory('leaderboard')}
                  selected={story === 'leaderboard'}
                  text="Рейтинг"
                >
                  <Icon28FavoriteOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setStory('profile')}
                  selected={story === 'profile'}
                  text="Профиль"
                >
                  <Icon28UserCircleOutline />
                </TabbarItem>
              </Tabbar>
            }
          >
            <View id="game" activePanel={activePanel}>
              <Home
                id="home"
                players={players}
                setPlayers={setPlayers}
                currentUser={user}
                onStart={goToGame}
              />
              <Game
                id="gameplay"
                players={players}
                setPlayers={setPlayers}
                onEndGame={endGame}
              />
              <Results id="results" players={players} onPlayAgain={playAgain} />
            </View>

            <View id="leaderboard" activePanel="leaderboard">
              <Leaderboard id="leaderboard" currentUser={user} />
            </View>

            <View id="profile" activePanel="profile">
              <Profile id="profile" currentUser={user} />
            </View>
          </Epic>
        </SplitCol>
      </SplitLayout>
    </ConfigProvider>
  );
}
