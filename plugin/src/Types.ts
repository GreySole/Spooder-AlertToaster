export interface KeyedObject {
  [key: string]: any;
}

export interface StreamMessage {
  userId: string;
  username: string;
  displayName: string;
  platform: string;
  channel: string;
  message: string;
  messageType: string;
  emotes: any[];
  tags: KeyedObject;
  isBroadcaster: boolean;
  isMod: boolean;
  isSubscriber: boolean;
  isVIP: boolean;
  isFirstMessage: boolean;
  isReturningChatter: boolean;
  triggeredEventData?: KeyedObject;
  platformEventData?: KeyedObject;
  pluginEventData?: KeyedObject;
}

export interface PluginModule {
  dirname: string;
  modules: PluginSpooderModules;
  activePlugins: KeyedObject;
  spooderConfig: PluginConfigInfo;
  spooderTheme: PluginThemeInfo;
  osc: PluginOscInfo;
  public: PluginPublicInfo;
  registerPluginApi: (
    router: 'local' | 'public',
    method: 'get' | 'post' | 'put' | 'delete',
    address: string,
    funct: (req: Request, res: Response) => void,
  ) => void;
  getActiveViewer: (req: Request) => KeyedObject | undefined;
  settings?: KeyedObject;
  onSettings?: (settings: KeyedObject) => void;
  onLoad?: () => void;
  onDestroy?: () => void;
  onChat?: (message: StreamMessage) => void;
  onOSC?: (message: OSCMessage) => void;
  onEvent?: (event: string, data: KeyedObject) => void;
  registerExtra: (key: string, value: any) => void;
}

type MessageArgValue = number | string | Blob | true | false | null | number;

export interface OSCMessage {
  address: string;
  args: MessageArgValue[];
}

interface PluginSpooderModules {
  stream: KeyedObject;
  community: KeyedObject;
  control: KeyedObject;
}

interface PluginPublicInfo {
  publicHostUrl: string;
  publicOscUrl: string;
}

interface PluginOscInfo {
  sendToTCP: (address: string, oscValue: any, log?: boolean) => void;
  sendToUDP: (address: string, oscValue: any, log?: boolean) => void;
  udpServers: KeyedObject;
}

interface PluginConfigInfo {
  ownerName: string;
  botName: string;
  host: string;
  hostPort: number;
  oscTcpPort: number;
  oscUdpPort: number;
  externalHandle: string;
}

interface PluginThemeInfo {
  webui: KeyedObject;
  spooderPet: KeyedObject;
}
