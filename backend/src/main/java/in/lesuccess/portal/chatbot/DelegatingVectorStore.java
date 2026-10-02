package in.lesuccess.portal.chatbot;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;

import java.util.List;
import java.util.function.Supplier;

/**
 * A read-only {@link VectorStore} that forwards every search to whichever store
 * {@link ChatKnowledgeIndexer} currently has active.
 *
 * <p>Exists because QuestionAnswerAdvisor keeps a final reference to the store it
 * was built with. Handing it the indexer's store directly would pin it to the
 * startup index forever; handing it this lets each rebuild's atomic swap take
 * effect on the very next query.</p>
 *
 * <p>Writes are rejected: the index is only ever replaced wholesale by a rebuild,
 * never patched per entity.</p>
 */
public class DelegatingVectorStore implements VectorStore {

    private final Supplier<VectorStore> activeStore;

    public DelegatingVectorStore(Supplier<VectorStore> activeStore) {
        this.activeStore = activeStore;
    }

    @Override
    public List<Document> similaritySearch(SearchRequest request) {
        return activeStore.get().similaritySearch(request);
    }

    @Override
    public void add(List<Document> documents) {
        throw readOnly();
    }

    @Override
    public void delete(List<String> idList) {
        throw readOnly();
    }

    @Override
    public void delete(Filter.Expression filterExpression) {
        throw readOnly();
    }

    private static UnsupportedOperationException readOnly() {
        return new UnsupportedOperationException(
                "The chat knowledge store is rebuilt wholesale by ChatKnowledgeIndexer, never edited in place");
    }
}
