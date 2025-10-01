import { AIChatView } from "@/modules/ai-chat/ui/views/ai-chat-view";

const Page = ({ params }: { params: { conversationId?: string[] } }) => {
    const conversationId = params.conversationId?.[0];
    return (
        <AIChatView conversationId={conversationId} />
    )
}

export default Page;