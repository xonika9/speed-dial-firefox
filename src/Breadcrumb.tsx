import { BiRegularChevronRight, BiRegularUpArrowAlt } from 'solid-icons/bi';
import { Component, For, Show, createResource, useContext } from 'solid-js';
import { Bookmarks } from 'webextension-polyfill';
import { getBookmarkPath, getBookmarkTitle } from './utils/bookmark';
import { SettingsContext, ToolbarFontOffest } from './settings';

interface BreadcrumbProps {
    readonly node: Bookmarks.BookmarkTreeNode;
    readonly onNode: (node: Bookmarks.BookmarkTreeNode) => void;
}

const Breadcrumb: Component<BreadcrumbProps> = props => {
    const [bookmarkPath] = createResource(
        () => props.node,
        node => getBookmarkPath(node.id),
        { initialValue: [] },
    );

    const [settings] = useContext(SettingsContext);

    return (
        <div
            class='header-item'
            style={{
                opacity: bookmarkPath().length > 1 ? 1 : 0,
                'margin-right': '20px',
            }}
        >
            <div class='breadcrumb-container'>
                <button
                    class='borderless'
                    onClick={() => {
                        const list = bookmarkPath();
                        if (list.length > 0) {
                            props.onNode(list[list.length - 2]);
                        }
                    }}
                >
                    <BiRegularUpArrowAlt size={settings.toolbarFont} />
                </button>
                <div
                    style={{
                        'border-left': '1px solid var(--text-color)',
                        margin: '5px',
                    }}
                />
                <For each={bookmarkPath().slice(0, bookmarkPath().length - 1)}>
                    {node => {
                        return (
                            <div
                                style={{
                                    display: 'flex',
                                    'align-items': 'center',
                                    'font-size': `${settings.toolbarFont + ToolbarFontOffest}px`,
                                }}
                            >
                                <button class='borderless' onClick={() => props.onNode(node)}>
                                    {getBookmarkTitle(node)}
                                </button>
                                <BiRegularChevronRight size={settings.toolbarFont} />
                            </div>
                        );
                    }}
                </For>
                <Show when={bookmarkPath().length > 0}>
                    <div
                        class='button-padding'
                        style={{
                            display: 'flex',
                            'align-items': 'center',
                            'font-size': `${settings.toolbarFont + ToolbarFontOffest}px`,
                        }}
                    >
                        {bookmarkPath()[bookmarkPath().length - 1].title}
                    </div>
                </Show>
            </div>
        </div>
    );
};

export default Breadcrumb;
