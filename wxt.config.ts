import { defineConfig } from 'wxt';

export default defineConfig({
    srcDir: 'src',
    entrypointsDir: 'entrypoints',
    modules: ['@wxt-dev/module-solid'],
    manifest: {
        name: 'Speed Dial New Tab',
        version: '1.0.3',
        description: 'Speed dial for your new tab page',
        permissions: ['bookmarks', 'storage', 'unlimitedStorage', 'tabHide'],
        host_permissions: ['<all_urls>'],
        browser_specific_settings: {
            gecko: {
                id: '{1f2a5a27-46cf-47ce-971e-4296aaa0c775}',
            },
        },
        action: {
            default_icon: 'icon/logo.png',
            default_title: 'Speed Dial New Tab',
        },
    },
});
