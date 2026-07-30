interface Block {
  type: 'heading' | 'list' | 'paragraph'
  text?: string
  items?: string[]
}

function parseContent(content: string): Block[] {
  const lines = content.split('\n')
  const blocks: Block[] = []
  let currentParagraph: string[] = []
  let currentList: string[] = []

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', text: currentParagraph.join(' ') })
      currentParagraph = []
    }
  }

  const flushList = () => {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: currentList })
      currentList = []
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', text: line.slice(3) })
    } else if (line.startsWith('- ')) {
      flushParagraph()
      currentList.push(line.slice(2))
    } else if (line === '') {
      flushParagraph()
      flushList()
    } else {
      flushList()
      currentParagraph.push(line)
    }
  }

  flushParagraph()
  flushList()

  return blocks
}

export default function LegalContentRenderer({ content }: { content: string }) {
  const blocks = parseContent(content)

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h2 key={i} className="text-2xl font-serif font-bold mb-3 mt-8 first:mt-0">
              {block.text}
            </h2>
          )
        }
        if (block.type === 'list') {
          return (
            <ul key={i} className="list-disc pl-6 space-y-1 mb-4">
              {block.items!.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="mb-4">
            {block.text}
          </p>
        )
      })}
    </>
  )
}
