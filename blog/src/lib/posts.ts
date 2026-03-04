import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const contentDir = path.join(process.cwd(), 'content')

export interface PostMeta {
    slug: string
    title: string
    description: string
    date: string
    readingTime: string
    thumbnail?: string
}

export interface Post extends PostMeta {
    contentHtml: string
}

export function getAllPosts(): PostMeta[] {
    const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.md'))

    return files
        .map(filename => {
            const slug = filename.replace('.md', '')
            const raw = fs.readFileSync(path.join(contentDir, filename), 'utf8')
            const { data } = matter(raw)
            return { slug, ...data } as PostMeta
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post> {
    const filePath = path.join(contentDir, `${slug}.md`)
    const raw = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(raw)

    const processed = await remark().use(html).process(content)

    // Converte {#id} em atributos id nos headings para os links do sumário funcionarem
    // Ex: <h2>Título {#meu-id}</h2>  →  <h2 id="meu-id">Título</h2>
    const contentHtml = processed
        .toString()
        .replace(
            /<(h[1-6])>(.*?)\s*\{#([^}]+)\}(.*?)<\/h[1-6]>/gs,
            '<$1 id="$3">$2$4</$1>'
        )

    return { slug, ...data, contentHtml } as Post
}
