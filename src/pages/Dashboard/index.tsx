import React, { useCallback, useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      try {
        api.get<IFoodPlate[]>('/foods').then(response => {
          setFoods(response.data);
        });
      } catch (err) {
        console.log(err);
      }
    }

    loadFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      try {
        const response = await api.post('/foods', { ...food, available: true });
        const newFood = response.data;

        setFoods([...foods, newFood]);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [foods],
  );

  const handleUpdateFood = useCallback(
    async (food: Omit<IFoodPlate, 'id' | 'available'>): Promise<void> => {
      const { id, available } = editingFood;

      const response = await api.put(`/foods/${id}`, {
        id,
        available,
        ...food,
      });

      setFoods(
        foods.map(findFood => {
          if (findFood.id === id) {
            return response.data;
          }

          return findFood;
        }),
      );
    },
    [foods, editingFood],
  );

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      await api.delete(`/foods/${id}`);

      const newFoods = foods.filter(food => food.id !== id);

      setFoods(newFoods);
    },
    [foods],
  );

  const toggleModal = useCallback((): void => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback((): void => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleEditFood = useCallback((food: IFoodPlate): void => {
    setEditModalOpen(true);
    setEditingFood(food);
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
