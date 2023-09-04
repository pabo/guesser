import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
// import {visualizer} from 'rollup-plugin-visualizer'


// https://vitejs.dev/config/
export default defineConfig({
  base: "", // relative links, for gh pages
  plugins: [
    // visualizer({
    //   template: "treemap", // or sunburst
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   filename: "analyse.html", // will be saved in project's root
    // }) as PluginOption,
    react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
  ],
  css: {
    modules: {
      localsConvention: "camelCaseOnly"
    }
  }
  // ... The rest of your configuration
});
