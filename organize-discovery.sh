#!/bin/bash

# Discovery Document Reorganization Script
# Moves discovery documents into Case_Alpha_TreeFarm structure

echo "📁 Starting discovery document reorganization..."

# Create target directories if they don't exist
mkdir -p data/Case_Alpha_TreeFarm/{plaintiff_productions,defendant_productions,pleadings,exhibits,correspondence,expert_reports}

# Organize Affidavits (Tree Farm/Plaintiff evidence)
echo "📄 Moving affidavits to plaintiff_productions..."
if [ -d "data/kass-new-docs/Affidavits" ]; then
    cp -r "data/kass-new-docs/Affidavits" "data/Case_Alpha_TreeFarm/plaintiff_productions/"
    echo "   ✅ Affidavits moved"
fi

# Organize Patents (Exhibits - historical evidence)
echo "📋 Moving patents to exhibits..."
if [ -d "data/kass-new-docs/Research Project/Patents" ]; then
    mkdir -p "data/Case_Alpha_TreeFarm/exhibits/Patents"
    cp -r "data/kass-new-docs/Research Project/Patents"/* "data/Case_Alpha_TreeFarm/exhibits/Patents/"
    echo "   ✅ Patents moved"
fi

# Organize News Articles (Exhibits - public record)
echo "📰 Moving news articles to exhibits..."
if [ -d "data/kass-new-docs/News Articles" ]; then
    mkdir -p "data/Case_Alpha_TreeFarm/exhibits/News_Articles"
    cp "data/kass-new-docs/News Articles"/*.pdf "data/Case_Alpha_TreeFarm/exhibits/News_Articles/" 2>/dev/null
    echo "   ✅ News articles moved"
fi

# Organize Research Project (Plaintiff productions)
echo "🔬 Moving research materials to plaintiff_productions..."
if [ -d "data/kass-new-docs/Research Project" ]; then
    mkdir -p "data/Case_Alpha_TreeFarm/plaintiff_productions/Research"
    # Copy specific research files (excluding patents already moved)
    find "data/kass-new-docs/Research Project" -name "*.pdf" -not -path "*/Patents/*" -exec cp {} "data/Case_Alpha_TreeFarm/plaintiff_productions/Research/" \;
    echo "   ✅ Research materials moved"
fi

# Move Chain of Conveyances (Key exhibit)
echo "🔗 Moving chain of conveyances..."
if [ -f "data/kass-new-docs/Chain of Conveyances 2025 12 15.pdf" ]; then
    cp "data/kass-new-docs/Chain of Conveyances 2025 12 15.pdf" "data/Case_Alpha_TreeFarm/exhibits/"
    echo "   ✅ Chain of conveyances moved"
fi

# Generate organization report
echo "📊 Generating organization report..."
find data/Case_Alpha_TreeFarm -type f -name "*.pdf" | wc -l > /tmp/organized_count
echo "📈 Organization Summary:"
echo "   📁 Total files organized: $(cat /tmp/organized_count)"
echo "   📂 Directory structure:"
find data/Case_Alpha_TreeFarm -type d | sed 's/^/      /'

echo "✅ Discovery document reorganization complete!"
echo ""
echo "🏗️  Case_Alpha_TreeFarm Structure:"
echo "├── plaintiff_productions/     # Tree Farm LLC evidence and productions"
echo "├── defendant_productions/     # Salt Lake County productions (to be added)"
echo "├── pleadings/                # Court filings and motions"
echo "├── exhibits/                 # Evidence exhibits"
echo "├── correspondence/           # Party communications"
echo "└── expert_reports/           # Expert witness materials"