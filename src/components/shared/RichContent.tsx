import { cn } from '@/lib/utils'
import MDEditor from '@uiw/react-md-editor'

export default function RichContent({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <MDEditor.Markdown
      source={content}
      style={{
        backgroundColor: 'transparent',
        color: 'inherit',
      }}
      className={cn('!bg-transparent', className)}
      rehypePlugins={[
        [
          // Add target="_blank" and rel="noopener noreferrer" to external links
          () => (tree: unknown) => {
            const visit = (node: Record<string, unknown>) => {
              if (node.type === 'element' && node.tagName === 'a') {
                const properties = node.properties as Record<string, unknown>
                const href = properties?.href as string
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                  properties.target = '_blank'
                  properties.rel = 'noopener noreferrer'
                }
              }
              if (node.children && Array.isArray(node.children)) {
                node.children.forEach(visit)
              }
            }
            visit(tree as Record<string, unknown>)
          },
        ],
      ]}
    />
  )
}
