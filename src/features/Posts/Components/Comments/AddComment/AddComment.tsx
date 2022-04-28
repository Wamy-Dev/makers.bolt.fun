import 'remirror/styles/all.css';
import styles from './styles.module.scss'

import javascript from 'refractor/lang/javascript';
import typescript from 'refractor/lang/typescript';
import {
    BoldExtension,
    CodeBlockExtension,
    CodeExtension,
    HardBreakExtension,
    ImageExtension,
    LinkExtension,
    MarkdownExtension,
    PlaceholderExtension,
} from 'remirror/extensions';
import { EditorComponent, Remirror, useRemirror } from '@remirror/react';
import { useCallback, useEffect, useMemo } from 'react';
import TextEditorComponents from 'src/Components/Inputs/TextEditor';
import Avatar from 'src/features/Profiles/Components/Avatar/Avatar';
import Toolbar from './Toolbar';
import Button from 'src/Components/Button/Button';


interface Props {
    initialContent?: string;
    name?: string;
}


export default function AddComment({ initialContent, name }: Props) {

    const linkExtension = useMemo(() => {
        const extension = new LinkExtension({ autoLink: true });
        extension.addHandler('onClick', (_, data) => {
            window.open(data.href, '_blank')?.focus();
            return true;
        });
        return extension;
    }, []);


    const extensions = useCallback(
        () => [
            new PlaceholderExtension({ placeholder: 'Leave a comment...' }),
            linkExtension,
            new BoldExtension(),
            new CodeExtension(),
            new CodeBlockExtension({
                supportedLanguages: [javascript, typescript]
            }),
            new ImageExtension({ enableResizing: true }),
            new MarkdownExtension({ copyAsMarkdown: false }),
            /**
             * `HardBreakExtension` allows us to create a newline inside paragraphs.
             * e.g. in a list item
             */
            new HardBreakExtension(),
        ],
        [linkExtension],
    );


    const { manager } = useRemirror({
        extensions,
        stringHandler: 'markdown',
    });


    return (
        <div className={`remirror-theme ${styles.wrapper} p-24 border rounded-12`}>
            <Remirror
                manager={manager}
                initialContent={initialContent}
            >
                <div className="flex gap-16 items-start pb-24 border-b border-gray-200 focus-within:border-primary-500">
                    <div className="mt-16 shrink-0"><Avatar width={48} src='https://i.pravatar.cc/150?img=1' /></div>
                    {/* <textarea
                        rows={2}
                        className="w-full border-0 text-gray-500 font-medium focus:!ring-0 resize-none"
                        placeholder='Leave a comment...'
                        ref={textAreaRef}
                    /> */}
                    <div className="flex-grow">
                        <EditorComponent />
                    </div>
                </div>
                <div className="flex gap-16 mt-16">
                    <Toolbar />
                    <Button color='primary' className='ml-auto'>Submit</Button>
                </div>
                {/* <TextEditorComponents.SaveModule name={name} /> */}
            </Remirror>
        </div>
    );
}
