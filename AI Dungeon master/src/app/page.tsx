'use client';

import React, {useState, useEffect} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {ScrollArea} from '@/components/ui/scroll-area';
import {generateStoryFromPrompt} from '@/ai/flows/generate-story-from-prompt';
import {interpretPlayerCommand} from '@/ai/flows/interpret-player-command';

export default function Home() {
  const [gameText, setGameText] = useState<string>('Welcome to Quest Weaver!\n');
  const [command, setCommand] = useState<string>('');
  const [gameState, setGameState] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [settingPreferences, setSettingPreferences] = useState<string>('');
  const [characterPreferences, setCharacterPreferences] = useState<string>('');
  const [plotPreferences, setPlotPreferences] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGenerateStory = async () => {
    setIsLoading(true);
    try {
      const storyResult = await generateStoryFromPrompt({
        prompt: prompt,
        settingPreferences: settingPreferences,
        characterPreferences: characterPreferences,
        plotPreferences: plotPreferences,
      });
      setGameText((prev) => prev + 'AI: ' + storyResult.story + '\n');
      setGameState(storyResult.story); // Initialize game state with the story
    } catch (error) {
      console.error('Failed to generate story:', error);
      setGameText((prev) => prev + 'Error: Failed to generate story.\n');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = async () => {
    if (command.trim() !== '') {
      setGameText((prev) => prev + '> ' + command + '\n');
      try {
        const aiResponse = await interpretPlayerCommand({
          command: command,
          gameState: gameState,
        });
        setGameText((prev) => prev + 'AI: ' + aiResponse.narration + '\n');
        setGameState(aiResponse.updatedGameState);
      } catch (error) {
        console.error('Failed to interpret command:', error);
        setGameText((prev) => prev + 'Error: Failed to process command.\n');
      } finally {
        setCommand('');
        // Ask the player what they want to do next
        setGameText((prev) => prev + 'What do you want to do next?\n');
      }
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    const scrollable = document.getElementById('scrollable-text');
    if (scrollable) {
      scrollable.scrollTop = scrollable.scrollHeight;
    }
  }, [gameText]);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Enter high-level story prompt (e.g., fantasy adventure)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Setting Preferences (e.g., medieval, futuristic)"
          value={settingPreferences}
          onChange={(e) => setSettingPreferences(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Character Preferences (e.g., heroic, comedic)"
          value={characterPreferences}
          onChange={(e) => setCharacterPreferences(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Plot Preferences (e.g., mystery, romance)"
          value={plotPreferences}
          onChange={(e) => setPlotPreferences(e.target.value)}
        />
        <Button onClick={handleGenerateStory} disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Story'}
        </Button>
      </div>

      <div className="flex-grow">
        <Card className="h-full rounded-none shadow-none bg-transparent">
          <CardContent className="p-4 h-full">
            <ScrollArea className="h-[calc(100vh - 350px)] w-full">
              <div id="scrollable-text" className="fade-in whitespace-pre-line">
                {gameText}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="p-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter command"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCommand();
              }
            }}
          />
          <Button onClick={handleCommand}>Send</Button>
        </div>
      </div>
    </div>
  );
}
