import os
import pandas as pd
from django.conf import settings
from sklearn.metrics.pairwise import cosine_similarity
import random

# Load DataFrame from CSV
def load_dataframe(filename):
    csv_path = os.path.join(settings.BASE_DIR, 'handleDataset', 'data', filename)
    df = pd.read_csv(csv_path)
    return df

# Process DataFrame
def process_data(df):
    if 'Price' in df.columns:
        df['Price'] = df['Price'].astype(str).str.replace(',', '.')
        df['Price'] = pd.to_numeric(df['Price'], errors='coerce')
    if 'Category' in df.columns:
        df = df.dropna(subset=['Category'])
    return df

# Load Products
def load_products(filename='products.csv'):
    products_df = load_dataframe(filename)
    products_df = process_data(products_df)
    if 'ProductName' not in products_df.columns:
        products_df = products_df.reset_index(drop=False)
    if 'Discount' not in products_df.columns:
        products_df['Discount'] = 0
    if 'BasicNeedsIndex' not in products_df.columns:
        products_df['BasicNeedsIndex'] = -1
    return products_df

# Load Purchases
def load_purchases(filename='purchases.csv'):
    purchases_df = load_dataframe(filename)
    if 'Amount' in purchases_df.columns:
        purchases_df['Amount'] = pd.to_numeric(purchases_df['Amount'], errors='coerce').fillna(0)
    return purchases_df

# Create User-Item Matrix
def create_user_item_matrix(purchases_df):
    user_item_matrix = purchases_df.pivot_table(
        index='PersonID',
        columns='ProductName',
        values='Amount',
        fill_value=0
    )
    return user_item_matrix

# Compute Item Similarity
def compute_item_similarity(user_item_matrix):
    item_similarity = pd.DataFrame(
        cosine_similarity(user_item_matrix.T),
        index=user_item_matrix.columns,
        columns=user_item_matrix.columns
    )
    return item_similarity

# Recommend Products for User
def recommend_products_for_user(person_id, user_item_matrix, item_similarity, top_n=20):
    if person_id not in user_item_matrix.index:
        return []

    user_row = user_item_matrix.loc[person_id]
    purchased = user_row[user_row > 0].index.tolist()

    if not purchased:
        # Recommend based on most popular items or randomly selected products
        return item_similarity.sum().sort_values(ascending=False).head(top_n).index.tolist()

    scores = pd.Series(dtype=float)
    for product in purchased:
        similar_items = item_similarity[product].drop(product, errors='ignore')
        scores = scores.add(similar_items * user_row[product], fill_value=0)

    # Add all products not yet purchased to the scoring pool
    missing_products = item_similarity.index.difference(purchased)
    scores = scores.reindex(scores.index.union(missing_products), fill_value=0)

    scores = scores.drop(purchased, errors='ignore')  # Exclude already purchased products
    return scores.nlargest(top_n).index.tolist()


# Get User Preferences
def get_user_preferences(person_id, purchases_df, products_df):
    merged = purchases_df.merge(products_df, on='ProductName', how='left')
    user_data = merged[merged['PersonID'] == person_id]
    
    if user_data.empty:
        return None, None, None

    total_amount = user_data['Amount'].sum()
    if total_amount > 0:
        user_avg_healthy = (user_data['HealthyIndex'] * user_data['Amount']).sum() / total_amount
    else:
        user_avg_healthy = user_data['HealthyIndex'].mean()

    category_sums = user_data.groupby('Category')['Amount'].sum().sort_values(ascending=False)
    top_categories = category_sums.index[:2].tolist() if not category_sums.empty else []
    purchased_categories = category_sums.index.tolist()

    return user_avg_healthy, top_categories, purchased_categories

# Determine User Type
def determine_user_type(user_avg_healthy):
    return 'healthy' if user_avg_healthy >= 5 else 'unhealthy'

# Refine Main Recommendations
def refine_recommendations(
    recommended_products, products_df, user_avg_healthy, 
    top_categories, purchased_categories, user_type, top_n=5, category_boost=5
):
    recommended_details = products_df[products_df['ProductName'].isin(recommended_products)].copy()

    # Dynamic scoring weights
    category_weight = category_boost  # Boost for previously purchased categories
    complementary_weight = 3  # Boost for complementary categories
    novelty_weight = 1  # Small weight for introducing new categories
    discount_weight = 2

    recommended_details['Score'] = 0

    # Boost scores for purchased and complementary categories
    recommended_details['Score'] += recommended_details['Category'].apply(
        lambda c: category_weight if c in purchased_categories else 
                  complementary_weight if c in top_categories else novelty_weight
    )

    # Adjust for health preferences
    if user_type == 'healthy':
        recommended_details['Score'] += recommended_details['HealthyIndex']
    else:
        recommended_details['Score'] += (10 - recommended_details['HealthyIndex'])

    # Include discounts for extra weight
    recommended_details['Score'] += recommended_details['Discount'].apply(
        lambda d: discount_weight * (d / 100)
    )

    # Sort by score and return top recommendations
    recommended_details = recommended_details.sort_values(
        by=['Score', 'HealthyIndex'], 
        ascending=[False, user_type == 'unhealthy']
    )
    return recommended_details['ProductName'].head(top_n).tolist()


# Recommend Discounted Items
def recommend_discounted_items(person_id, purchases_df, products_df, top_categories, purchased_categories, user_type, top_n=5):
    user_purchases = purchases_df[purchases_df['PersonID'] == person_id]
    purchased_items = user_purchases['ProductName'].unique().tolist()

    candidate_products = products_df[
        (products_df['Category'].isin(top_categories)) &
        (~products_df['ProductName'].isin(purchased_items)) &
        (products_df['Discount'] > 0)
    ].copy()

    if len(candidate_products) < top_n:
        additional_candidates = products_df[
            (products_df['Category'].isin(purchased_categories)) &
            (~products_df['ProductName'].isin(purchased_items)) &
            (products_df['Discount'] > 0)
        ].copy()
        candidate_products = pd.concat([candidate_products, additional_candidates]).drop_duplicates()

    if user_type == 'healthy':
        candidate_products['Score'] = candidate_products['BasicNeedsIndex'].apply(lambda b: 5 if b == 10 else 0)
    else:
        candidate_products['Score'] = candidate_products['BasicNeedsIndex'].apply(lambda b: 5 if b == -1 else 0)

    candidate_products['Score'] += candidate_products['Discount'].apply(lambda d: min(4, d // 10))

    if user_type == 'healthy':
        candidate_products = candidate_products.sort_values(by=['Score', 'HealthyIndex'], ascending=[False, False])
    else:
        candidate_products = candidate_products.sort_values(by=['Score', 'HealthyIndex'], ascending=[False, True])

    return candidate_products['ProductName'].head(top_n).tolist()

# Recommend BasicNeeds Items
def recommend_basicneeds_items(person_id, purchases_df, products_df, top_categories, purchased_categories, top_n=3):
    user_purchases = purchases_df[purchases_df['PersonID'] == person_id]
    purchased_items = user_purchases['ProductName'].unique().tolist()

    candidate_products = products_df[
        (products_df['BasicNeedsIndex'] == 10) &
        (~products_df['ProductName'].isin(purchased_items)) &
        (products_df['Category'].isin(top_categories + purchased_categories))
    ].copy()

    if len(candidate_products) < top_n:
        additional_candidates = products_df[
            (products_df['BasicNeedsIndex'] == 10) &
            (~products_df['ProductName'].isin(purchased_items))
        ].copy()
        candidate_products = pd.concat([candidate_products, additional_candidates]).drop_duplicates()

    candidate_products['Score'] = candidate_products['Category'].apply(
        lambda c: 5 if c in top_categories else 2 if c in purchased_categories else 0
    )
    candidate_products = candidate_products.sort_values(by=['Score', 'Price'], ascending=[False, True])

    return candidate_products['ProductName'].head(top_n).tolist()

# Recommend Based on Profile Similarity
def recommend_similarity_products(
    person_id, user_item_matrix, products_df, all_recommended, top_n=5, diversity_boost=2
):
    if person_id not in user_item_matrix.index:
        return []

    user_similarity = cosine_similarity(user_item_matrix)
    similarity_df = pd.DataFrame(
        user_similarity, 
        index=user_item_matrix.index, 
        columns=user_item_matrix.index
    )
    similar_users = similarity_df[person_id].drop(person_id).sort_values(ascending=False).index.tolist()

    candidate_scores = pd.Series(dtype=float)
    for similar_user in similar_users:
        similar_purchases = user_item_matrix.loc[similar_user]
        not_purchased = similar_purchases[
            (similar_purchases > 0) & 
            (~similar_purchases.index.isin(all_recommended))
        ]
        candidate_scores = candidate_scores.add(
            not_purchased * similarity_df.at[person_id, similar_user], 
            fill_value=0
        )

    # Normalize scores and ensure diverse category representation
    candidate_scores = candidate_scores.sort_values(ascending=False)
    candidate_products = products_df[
        products_df['ProductName'].isin(candidate_scores.index)
    ]

    # Define the diversity weight within the function
    diversity_weight = diversity_boost

    underrepresented_categories = products_df['Category'].value_counts().tail(5).index.tolist()
    candidate_products['DiversityBoost'] = candidate_products['Category'].apply(
        lambda c: diversity_weight if c in underrepresented_categories else 0
    )
    candidate_products['FinalScore'] = candidate_products['DiversityBoost'] + candidate_scores.reindex(candidate_products['ProductName'], fill_value=0)

    return candidate_products.sort_values('FinalScore', ascending=False).head(top_n)['ProductName'].tolist()

def get_recommendations_for_person(person_id, top_n=10):
    purchases_df = load_purchases('purchases.csv')
    products_df = load_products('products.csv')

    user_item_matrix = create_user_item_matrix(purchases_df)
    item_similarity = compute_item_similarity(user_item_matrix)

    # Step 1: Main Recommendations
    initial_recommendations = recommend_products_for_user(person_id, user_item_matrix, item_similarity, top_n=20)

    user_avg_healthy, top_categories, purchased_categories = get_user_preferences(person_id, purchases_df, products_df)
    user_type = determine_user_type(user_avg_healthy)

    final_recommendations = refine_recommendations(
        initial_recommendations,
        products_df,
        user_avg_healthy,
        top_categories,
        purchased_categories,
        user_type,
        top_n=top_n
    )
    
    # Step 2: Filter for specific items based on purchase history
    user_purchases = purchases_df[purchases_df['PersonID'] == person_id]['ProductName'].unique()
    special_items = ['Scutece', 'Absorbante']

    # Remove "Scutece" and "Absorbante" unless they are in the user's purchase history
    products_df = products_df[~products_df['ProductName'].isin(special_items) | 
                              products_df['ProductName'].isin(user_purchases)]

    # Step 3: Split recommendations into healthy and unhealthy groups
    all_recommended = set(final_recommendations)

    # Unhealthy recommendations
    unhealthy_candidates = products_df[
        (products_df['HealthyIndex'] <= 5) &
        (~products_df['ProductName'].isin(all_recommended))
    ]
    unhealthy_recommendations = unhealthy_candidates['ProductName'].head(int(top_n * 0.6)).tolist()

    all_recommended.update(unhealthy_recommendations)

    # Healthy recommendations
    healthy_candidates = products_df[
        (products_df['HealthyIndex'] > 5) &
        (~products_df['ProductName'].isin(all_recommended))
    ]
    healthy_recommendations = healthy_candidates['ProductName'].head(int(top_n * 0.4)).tolist()

    all_recommended.update(healthy_recommendations)

    # Step 4: Add similarity-based and basic needs recommendations
    similarity_recommendations = recommend_similarity_products(
        person_id,
        user_item_matrix,
        products_df[~products_df['ProductName'].isin(all_recommended)],
        all_recommended,
        top_n=5
    )
    all_recommended.update(similarity_recommendations)

    basicneeds_recommendations = recommend_basicneeds_items(
        person_id,
        purchases_df,
        products_df[~products_df['ProductName'].isin(all_recommended)],
        top_categories,
        purchased_categories,
        top_n=2
    )
    all_recommended.update(basicneeds_recommendations)

    # Combine all recommendations
    combined_recommendations = unhealthy_recommendations + healthy_recommendations + list(all_recommended)

    # Create a DataFrame to manage scores
    recommendation_scores = products_df[products_df['ProductName'].isin(combined_recommendations)].copy()

    # Enforce subcategory limit
    subcategory_limit = 1
    restricted_recommendations = recommendation_scores.groupby('Subcategory').apply(
        lambda group: group.head(subcategory_limit) if group.name == 'Lapte' else group
    ).reset_index(drop=True)

    # Replace excess items with alternatives
    excess_items = recommendation_scores[~recommendation_scores['ProductName'].isin(restricted_recommendations['ProductName'])]
    alternative_items = excess_items.head(top_n - len(restricted_recommendations))
    recommendation_scores = pd.concat([restricted_recommendations, alternative_items])

    # Weighted scoring for relevance
    recommendation_scores['RelevanceScore'] = 0

    # Boost products from user's top and purchased categories
    recommendation_scores['RelevanceScore'] += recommendation_scores['Category'].apply(
        lambda c: 5 if c in top_categories else 3 if c in purchased_categories else 1
    )

    # Adjust for health preferences
    if user_type == 'healthy':
        recommendation_scores['RelevanceScore'] += recommendation_scores['HealthyIndex']
    else:
        recommendation_scores['RelevanceScore'] += recommendation_scores['HealthyIndex'].apply(
            lambda h: (10 - h) if h < 5 else h * 0.5
        )

    # Boost items with discounts
    recommendation_scores['RelevanceScore'] += recommendation_scores['Discount'] / 10

    # Finalize recommendation order
    recommendation_scores = recommendation_scores.sort_values('RelevanceScore', ascending=False)
    selected_recommendations = recommendation_scores.head(top_n)

    # Enrich recommendations with details, including imageUrl
    enriched_recommendations = selected_recommendations[['ProductName', 'Price', 'Discount']].copy()

    # Add imageUrl column
    enriched_recommendations['imageUrl'] = enriched_recommendations['ProductName'].apply(
        lambda name: f"/{name.replace(',', '').replace('/', '')}.png"
    )

    # Rename columns to match desired keys
    enriched_recommendations.rename(
        columns={
            'ProductName': 'name',
            'Price': 'price',
            'Discount': 'discount'
        },
        inplace=True
    )

    return enriched_recommendations.to_dict(orient='records')


# Example Usage
# comb = get_recommendations_for_person(person_id=11, top_n=10)
# print("Main Recommendations:", comb)