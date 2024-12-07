import os
import pandas as pd
from django.conf import settings
from sklearn.metrics.pairwise import cosine_similarity

def load_dataframe(filename='dataset.csv'):
    csv_path = os.path.join(settings.BASE_DIR, 'handleDataset', 'data', filename)
    df = pd.read_csv(csv_path)
    return df

def process_data(df):
    if 'Price' in df.columns:
        df['Price'] = df['Price'].astype(str).str.replace(',', '.')
        df['Price'] = pd.to_numeric(df['Price'], errors='coerce')
    if 'Category' in df.columns:
        df = df.dropna(subset=['Category'])
    return df

def load_products(filename='products.csv'):
    products_df = load_dataframe(filename)
    products_df = process_data(products_df)
    # Ensure ProductName is a column, not the index
    if 'ProductName' not in products_df.columns:
        # If ProductName ended up as the index, reset it
        products_df = products_df.reset_index(drop=False)
    return products_df

def load_purchases(filename='purchases.csv'):
    purchases_df = load_dataframe(filename)
    if 'Amount' in purchases_df.columns:
        purchases_df['Amount'] = pd.to_numeric(purchases_df['Amount'], errors='coerce').fillna(0)
    return purchases_df

def create_user_item_matrix(purchases_df):
    user_item_matrix = purchases_df.pivot_table(
        index='PersonID',
        columns='ProductName',
        values='Amount',
        fill_value=0
    )
    return user_item_matrix

def compute_item_similarity(user_item_matrix):
    item_similarity = pd.DataFrame(
        cosine_similarity(user_item_matrix.T),
        index=user_item_matrix.columns,
        columns=user_item_matrix.columns
    )
    return item_similarity

def recommend_products_for_user(person_id, user_item_matrix, item_similarity, top_n=20):
    if person_id not in user_item_matrix.index:
        return []

    user_row = user_item_matrix.loc[person_id]
    purchased = user_row[user_row > 0].index.tolist()

    if not purchased:
        return []

    scores = pd.Series(dtype=float)
    for product in purchased:
        similar_items = item_similarity[product].drop(product)
        scores = scores.add(similar_items * user_row[product], fill_value=0)

    scores = scores.drop(purchased, errors='ignore')
    return scores.nlargest(top_n).index.tolist()

def get_user_preferences(person_id, purchases_df, products_df):
    merged = purchases_df.merge(products_df, on='ProductName', how='left')
    user_data = merged[merged['PersonID'] == person_id]
    
    if user_data.empty:
        return None, None

    total_amount = user_data['Amount'].sum()
    if total_amount > 0:
        user_avg_healthy = (user_data['HealthyIndex'] * user_data['Amount']).sum() / total_amount
    else:
        user_avg_healthy = user_data['HealthyIndex'].mean()
    
    category_sums = user_data.groupby('Category')['Amount'].sum().sort_values(ascending=False)
    top_categories = category_sums.index[:2].tolist() if not category_sums.empty else []

    return user_avg_healthy, top_categories

def refine_recommendations(recommended_products, products_df, user_avg_healthy, top_categories, top_n=5):
    recommended_details = products_df[products_df['ProductName'].isin(recommended_products)].copy()

    recommended_details['Score'] = 1
    recommended_details['Score'] += recommended_details['Category'].apply(lambda c: 1 if c in top_categories else 0)
    recommended_details['Score'] += recommended_details['HealthyIndex'].apply(lambda h: 1 if h >= user_avg_healthy else 0)
    
    recommended_details = recommended_details.sort_values(by=['Score', 'HealthyIndex'], ascending=False)
    return recommended_details['ProductName'].head(top_n).tolist()

def get_recommendations_for_person(person_id, top_n=5):
    purchases_df = load_purchases('purchases.csv')
    products_df = load_products('products.csv')

    # Debug prints
    print("Loaded Purchases DataFrame:")
    print(purchases_df.head())
    print("Loaded Products DataFrame:")
    print(products_df.head())

    user_item_matrix = create_user_item_matrix(purchases_df)
    print("User-Item Matrix:")
    print(user_item_matrix)

    item_similarity = compute_item_similarity(user_item_matrix)
    print("Item Similarity Matrix:")
    print(item_similarity.head())

    initial_recommendations = recommend_products_for_user(person_id, user_item_matrix, item_similarity, top_n=20)
    print(f"Initial recommendations for user {person_id}: {initial_recommendations}")

    if not initial_recommendations:
        return []

    user_avg_healthy, top_categories = get_user_preferences(person_id, purchases_df, products_df)
    print(f"User {person_id} Avg Healthy Index: {user_avg_healthy}, Top Categories: {top_categories}")

    if user_avg_healthy is None:
        return initial_recommendations[:top_n]

    refined = refine_recommendations(initial_recommendations, products_df, user_avg_healthy, top_categories, top_n=top_n)
    print(f"Refined recommendations for user {person_id}: {refined}")
    return refined

# Example usage:
recommended = get_recommendations_for_person(person_id=11, top_n=5)
print("Final Recommendations:", recommended)
