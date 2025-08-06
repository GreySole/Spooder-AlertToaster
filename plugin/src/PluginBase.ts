import { PluginModule } from './Types';

export default class PluginBase implements Partial<PluginModule> {
  dirname!: string;
  modules!: PluginModule['modules'];
  activePlugins!: PluginModule['activePlugins'];
  spooderConfig!: PluginModule['spooderConfig'];
  spooderTheme!: PluginModule['spooderTheme'];
  osc!: PluginModule['osc'];
  public!: PluginModule['public'];
  registerPluginApi?: PluginModule['registerPluginApi'];
  getActiveViewer?: PluginModule['getActiveViewer'];
  settings?: PluginModule['settings'];
  onSettings?: PluginModule['onSettings'];
  onDestroy?: PluginModule['onDestroy'];
  registerExtra?: PluginModule['registerExtra'];
}
