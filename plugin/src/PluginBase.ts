import { Request, Response } from "express";
import {
  IntegrationModule,
  KeyedObject,
  OSCMessage,
  PluginChatInfo,
  PluginConfigInfo,
  PluginModule,
  PluginOscInfo,
  PluginPublicInfo,
  PluginSpooderModules,
  PluginThemeInfo,
  StreamMessage,
} from "./Types";

export default class PluginBase implements Partial<PluginModule> {
  dirname: string = "";
  modules: PluginSpooderModules = {
    stream: {},
    community: {},
    control: {},
  };
  activePlugins: KeyedObject = {};
  spooderConfig: PluginConfigInfo = {
    ownerName: "",
    botName: "",
    host: "",
    hostPort: 0,
    oscTcpPort: 0,
    oscUdpPort: 0,
    externalHandle: "disabled",
  };
  spooderTheme: PluginThemeInfo = {
    webui: {},
    spooderPet: {},
  };
  osc: PluginOscInfo = {
    sendToTCP: (address: string, oscValue: any, log?: boolean): void => {
      // Default implementation does nothing
    },
    sendToUDP: (address: string, oscValue: any, log?: boolean): void => {
      // Default implementation does nothing
    },
    udpServers: {},
  };
  public: PluginPublicInfo = {
    publicHostUrl: "",
    publicOscUrl: "",
  };
  chat: PluginChatInfo = {
    sayInChat: (message: string, channel?: string): void => {
      // Default implementation does nothing
    },
  };
  settings: KeyedObject = {};

  registerPluginApi(
    router: "local" | "public",
    method: "get" | "post" | "put" | "delete",
    address: string,
    funct: (req: Request, res: Response) => void
  ): void {
    // Default implementation does nothing
  }

  getModule(name: string): IntegrationModule | undefined {
    return undefined;
  }

  getActiveViewer(req: Request): KeyedObject | undefined {
    // Default implementation returns undefined
    return undefined;
  }

  getAssetPath(assetPath: string): string {
    // Default implementation returns an empty string
    return "";
  }

  getLocalFilePath(filePath: string): string {
    // Default implementation returns an empty string
    return "";
  }

  onSettings(settings: KeyedObject): void {
    // Default implementation does nothing
  }

  onLoad(): void {
    // Default implementation does nothing
  }

  onDestroy(): void {
    // Default implementation does nothing
  }

  onChat(message: StreamMessage): void {
    // Default implementation does nothing
  }

  onCommunityChat(type: string, data: any): void {
    // Default implementation does nothing
  }

  onOSC(message: OSCMessage): void {
    // Default implementation does nothing
  }

  onEvent(event: string, data: KeyedObject): void {
    // Default implementation does nothing
  }

  registerExtra(key: string, value: any): void {
    // Default implementation does nothing
  }
}
